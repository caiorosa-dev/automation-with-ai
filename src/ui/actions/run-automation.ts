import database from '../../database';

import { executeAutomation } from '../../modules/automation';

export async function runAutomation() {
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
