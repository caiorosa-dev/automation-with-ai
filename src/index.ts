import {
  extractDataFromImageFile,
  processExtractedDataIntoCustomerJSON,
} from './modules/ai-processing';

const dotenv = require('dotenv');

async function runAutomation() {
  dotenv.config();

  const extractedObject = await extractDataFromImageFile(
    './photos/page-01.jpeg',
    true
  );

  console.log(extractedObject);

  const parsedData = await processExtractedDataIntoCustomerJSON(
    extractedObject.data
  );

  console.log(parsedData);
}

runAutomation();
