import puppeteer from 'puppeteer';
import { Customer } from '../types/Customer';

const wait = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

const DEFAULT_CULTURE = 'Arroz Irrigado';
const DEFAULT_PASSWORD = 'Brava2024';
const DEFAULT_CANAL = 'BRAVA NORTE AGRICOLA LTDA';

export const executeAutomation = async (customer: Customer) => {
  console.log('Iniciando o navegador...');
  const browser = await puppeteer.launch({ headless: false }); // Mantém o navegador visível
  const page = await browser.newPage();

  console.log('Navegando para o site...');
  await page.goto('https://conecta.ag');
  await wait(3000);

  console.log('Aguardando o botão de idade confirmar...');
  await page.waitForSelector('#btn-age-confirm');
  console.log('Idade confirmada');
  await wait(1000);

  await page.click('#btn-age-confirm');
  console.log('Idade confirmada');
  await wait(3000);

  console.log('Aguardando o botão de captcha...');
  await page.waitForSelector('#ot-sdk-btn');
  await page.click('#ot-sdk-btn');
  console.log('Captcha resolvido');
  await wait(1000);

  await page.waitForSelector('.customer-login-link');
  console.log('Clicando no link de login do cliente...');
  await page.click('.customer-login-link');
  await wait(3000);

  console.log('Preenchendo o campo de email...');
  await page.type('#customer-email', customer.email);
  console.log(`Email preenchido: ${customer.email}`);

  console.log('Preenchendo o campo de senha...');
  await page.type('#pass', DEFAULT_PASSWORD);
  console.log('Senha preenchida');

  console.log('Submetendo o formulário...');
  await page.click('#send2');

  console.log('Aguardando a navegação completar...');
  await page.waitForNavigation();
  console.log('Navegação completa.');

  await wait(5000);

  await page.goto('https://conecta.ag/programas/hotsite');
  await wait(5000);

  await page.click('.ant-modal-close');

  await page.waitForSelector('li[title="Resgatar"]');
  await page.click('li[title="Resgatar"]');

  await wait(5000);

  console.log('Acessando o site de cadastro...');
  await page.goto('https://agrega.basf.com.br/cadastro');
  //await page.waitForNavigation();

  console.log('Preenchendo cultura...');
  await page.waitForSelector('#rc_select_1'); // Seleciona o campo de seleção de cultura
  await page.click('#rc_select_1');
  await wait(1000); // Aguarda a abertura do dropdown

  await page.keyboard.type(DEFAULT_CULTURE); // Digita o nome da cultura
  await wait(1000); // Aguarda a digitação ser processada

  await page.keyboard.press('Enter'); // Pressiona Enter para selecionar a cultura
  console.log(`Cultura preenchida: ${DEFAULT_CULTURE}`);
  await wait(3000);

  console.log('Preenchendo hectares...');
  const hectaresSelector = 'input[placeholder="000000"]';
  await page.waitForSelector(hectaresSelector);
  await page.focus(hectaresSelector);
  await page.keyboard.type(customer.hectares.toString());
  console.log(`Hectare preenchido: ${customer.hectares}`);
  await wait(3000);

  console.log('Preenchendo canal...');
  await page.waitForSelector('#rc_select_0'); // Seleciona o campo de seleção de canal
  await page.click('#rc_select_0');
  await wait(1000); // Aguarda a abertura do dropdown

  await page.keyboard.type(DEFAULT_CANAL); // Digita o nome do canal
  await wait(1000); // Aguarda a digitação ser processada

  await page.keyboard.press('Enter'); // Pressiona Enter para selecionar o canal
  console.log(`Canal preenchido: ${DEFAULT_CANAL}`);
  await wait(3000);

  console.log('Marcando check boxes...');
  const checkboxSelector = 'input.PrivateSwitchBase-input';
  try {
    await page.waitForSelector(checkboxSelector);

    const checkboxes = await page.$$(checkboxSelector);

    const count = Math.min(checkboxes.length, 3);

    for (let i = 0; i < count; i++) {
      const checkbox = checkboxes[i];

      const isChecked = await page.evaluate((element) => {
        return element.checked;
      }, checkbox);

      if (!isChecked) {
        await page.evaluate((element) => {
          element.click();
        }, checkbox);
        console.log(`Checkbox ${i + 1} marcada`);
      }

      await wait(1000);
    }
  } catch (error) {
    console.error(`Erro ao marcar os checkboxes:`, error);
  }

  console.log('Clicando em Salvar...');
  await page.waitForSelector('button.sc-beqWaB.heiIYJ.sc-hyBYnz.isdZLp');
  await page.click('button.sc-beqWaB.heiIYJ.sc-hyBYnz.isdZLp');
  console.log('Salvo com sucesso');
  await wait(3000);

  console.log('Fechando o navegador...');
  await browser.close();
  console.log('Navegador fechado.');
};

module.exports = { executeAutomation };
