import { runMenu } from './ui/menu';

const dotenv = require('dotenv');

async function runAutomation() {
  dotenv.config();

  runMenu();
}

runAutomation();
