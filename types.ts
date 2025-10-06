
export interface Product {
  name: string;
  quantity: number;
  sku: string | null;
}

export interface LabelData {
  trackingNumber: string;
  orderId: string;
  recipientName: string;
  recipientAddress: string;
  courier: string;
  platform: string;
  products: Product[];
}
