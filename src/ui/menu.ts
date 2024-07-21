import { select } from '@inquirer/prompts';
import { loadImages } from './actions/load-images';
import { runAutomation } from './actions/run-automation';

export async function runMenu() {
  while (true) {
    console.log('\n');
    console.log('-----------------------------------------------');
    console.log('Automação para cadastro de clientes com IA');
    console.log('Feito por: https://github.com/caiorosa-dev');
    console.log('v 1.0.0');
    console.log('-----------------------------------------------');
    console.log('\n');

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
