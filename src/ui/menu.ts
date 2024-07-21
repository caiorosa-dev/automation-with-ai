import { select } from '@inquirer/prompts';
import { loadImages } from './actions/load-images';
import { runAutomation } from './actions/run-automation';

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
