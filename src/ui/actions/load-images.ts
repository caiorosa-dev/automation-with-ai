import { readdirSync } from 'fs';
import { createSpinner } from 'nanospinner';
import { resolve } from 'path';
import database from '../../database';
import {
  extractDataFromImageFile,
  processExtractedDataIntoCustomerJSON,
} from '../../modules/ai-processing';

export async function loadImages() {
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
