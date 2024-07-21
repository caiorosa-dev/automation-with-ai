import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import {
  DatabaseCustomer,
  DatabaseData,
  DatabasePhoto,
  Status,
} from 'src/types/Database';

class Database {
  readonly relativePath: string[] = ['data', 'database.json'];
  readonly path: string;

  data: DatabaseData | null = null;

  constructor() {
    this.path = path.resolve(...this.relativePath);

    this.init();
  }

  init() {
    if (existsSync(this.path)) {
      this.data = JSON.parse(readFileSync(this.path, 'utf-8'));
      return;
    }

    this.data = {
      customers: [],
      photos: [],
    };
  }

  existsPhoto(filePath: string) {
    return this.data?.photos.some((photo) => photo.path === filePath);
  }

  listCustomers() {
    return this.data?.customers || [];
  }

  setCustomerStatus(customerEmail: string, status: Status) {
    if (this.data == null) throw new Error('Database data is null');

    const customerIndex = this.data.customers.findIndex(
      (customer) => customer.email === customerEmail
    );

    if (customerIndex !== undefined && customerIndex !== -1) {
      this.data.customers[customerIndex].status = status;
    }
  }

  addPhoto(photo: DatabasePhoto) {
    if (this.data == null) throw new Error('Database data is null');

    this.data.photos.push(photo);
  }

  addCustomer(customer: DatabaseCustomer) {
    if (this.data == null) throw new Error('Database data is null');

    this.data.customers.push(customer);
  }

  save() {
    if (this.data == null) throw new Error('Database data is null');

    writeFileSync(this.path, JSON.stringify(this.data, null, 2));
  }
}

export default new Database();
