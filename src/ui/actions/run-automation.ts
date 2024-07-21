import database from '../../database';

import { executeAutomation } from '../../modules/automation';

export async function runAutomation() {
  const customers = database
    .listCustomers()
    .filter((customer) => customer.status === 'WAITING');

  console.log(`Rodando automação para ${customers.length} clientes...\n`);

  for (const customer of customers) {
    const start = Date.now();
    database.setCustomerStatus(customer.email, 'PROCESSING');
    database.save();

    console.log(
      `Rodando automação para ${customer.email}...\n-------------------------------------------\n\n`
    );

    try {
      await executeAutomation(customer);
    } catch (error: any) {
      console.error(
        `Ocorreu um erro ao executar a automação para o usuário ${customer.email}: ${error}`
      );
      database.updateCustomer({
        ...customer,
        status: 'ERROR',
        errorMessage: error.toString(),
        timeToProcess: Date.now() - start,
      });
      database.save();
      continue;
    }

    console.log(
      `\n-------------------------------------------\nAutomação para ${customer.email} finalizada com sucesso!`
    );
    database.updateCustomer({
      ...customer,
      status: 'OK',
      timeToProcess: Date.now() - start,
    });
    database.save();
  }

  console.log('\nAutomação finalizada com sucesso!');
}
