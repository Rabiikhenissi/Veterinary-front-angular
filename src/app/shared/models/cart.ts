export class CartProduct {
    productId: string;
    quantity: number;
    product?: any; 
  }
  
  export class Cart {
    _id?: string;
    userId: string;
    totalPrice: number;
    products: CartProduct[];
  }