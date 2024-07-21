import { select } from '@inquirer/prompts';
import { readdirSync } from 'fs';
import { createSpinner } from 'nanospinner';
import { parse, resolve } from 'path';
import database from '../database';
import {
  extractDataFromImageFile,
  processExtractedDataIntoCustomerJSON,
} from '../modules/ai-processing';
import { executeAutomation } from '../modules/automation';

async function loadImages() {
  console.log('Carregando imagens...\n');

  const files = readdirSync('./photos');

  for (const file of files.filter((file) => !file.endsWith('.gitkeep'))) {
    const spinner = createSpinner(`Carregando imagem: ${file}`, {
      color: 'magenta',
    }).start();

    const filePath = resolve('./photos', file);

    const exists = database.existsPhoto(filePath);

    if (!exists) {
      spinner.update({
        text: `[IA] Extraindo dados da imagem: ${file}...`,
      });
      const extractedObject = await extractDataFromImageFile(filePath, true);

      spinner.update({
        text: `[IA] Processando dados da imagem: ${file}...`,
      });
      const parsedData = await processExtractedDataIntoCustomerJSON(
        extractedObject.data
      );

      spinner.update({
        text: `Adicionando dados dos clientes no banco de dados...`,
      });

      for (const customer of parsedData.data) {
        database.addCustomer({
          email: customer.email,
          hectares: customer.hectares,
          status: 'WAITING',
        });
      }

      spinner.update({
        text: `Adicionando dados da imagem no banco de dados: ${file}...`,
      });

      database.addPhoto({
        extractedData: extractedObject.data,
        onlyWithOk: true,
        parsedData: parsedData.data,
        path: filePath,
        usage: {
          photoExtraction: extractedObject.usage,
          dataParsing: parsedData.usage,
        },
      });
      spinner.update({
        text: `Salvando banco de dados...`,
      });
      database.save();

      spinner.success({ text: `Imagem ${file} carregada com sucesso` });
    } else {
      spinner.warn({
        text: `Imagem ${file} já existe no banco de dados, pulando...`,
      });
    }
  }

  console.log('\nImagens carregadas com sucesso!');
}

async function runAutomation() {
  const customers = database
    .listCustomers()
    .filter((customer) => customer.status === 'WAITING');

  console.log(`Rodando automação para ${customers.length} clientes...\n`);

  for (const customer of customers) {
    database.setCustomerStatus(customer.email, 'PROCESSING');
    database.save();

    console.log(
      `Rodando automação para ${customer.email}...\n-------------------------------------------\n\n`
    );

    try {
      await executeAutomation(customer);
    } catch (error) {
      console.error(
        `Ocorreu um erro ao executar a automação para o usuário ${customer.email}: ${error}`
      );
      database.setCustomerStatus(customer.email, 'ERROR');
      database.save();
      continue;
    }

    console.log(
      `\n-------------------------------------------\nAutomação para ${customer.email} finalizada com sucesso!`
    );
    database.setCustomerStatus(customer.email, 'OK');
    database.save();
  }

  console.log('\nAutomação finalizada com sucesso!');
}

export async function runMenu() {
  while (true) {
    const reply = await select({
      message: 'O que você quer fazer?',
      choices: [
        {
          name: 'Carregar imagens',
          value: 'load-images',
        },
        {
          name: 'Rodar automação',
          value: 'run-automation',
        },
        {
          name: 'Sair',
          value: 'exit',
        },
      ],
    });

    switch (reply) {
      case 'load-images':
        await loadImages();
        break;
      case 'run-automation':
        await runAutomation();
        break;
      case 'exit':
        process.exit(0);
      default:
        console.log('Opção inválida');
        break;
    }
  }
}
