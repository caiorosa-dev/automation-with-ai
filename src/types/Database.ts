import { Usage } from 'src/modules/ai-processing';
import { Customer } from 'src/types/Customer';

export type Status = 'OK' | 'PROCESSING' | 'WAITING' | 'ERROR';

export type DatabasePhoto = {
  path: string;
  onlyWithOk: boolean;
  extractedData: string;
  parsedData: Customer[];
  usage: {
    photoExtraction: Usage;
    dataParsing: Usage;
  };
};

export type DatabaseCustomer = {
  email: string;
  hectares: number;
  status: Status;
};

export type DatabaseData = {
  photos: DatabasePhoto[];
  customers: DatabaseCustomer[];
};
