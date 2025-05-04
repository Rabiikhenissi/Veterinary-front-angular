export class Product {
    _id?: string;
    name: string;
    description?: string;
    category: string;
    price: number;
    quantity?: number;
    image?: string;
    expirationDate?: Date;
    species?:  string[]; 
    archived?: boolean;
    limitPerUser?: number;
  }
  