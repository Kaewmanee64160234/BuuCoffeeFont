export interface Customer {
    customerId: number;
    customerName: string;
    customerNumberOfStamp: number;
    customerPhone: string;
    createMemberDate: Date;
  }

  export function mapToCustomer(data: any): Customer {
    return {
      customerId: data.customerId,
      customerName: data.customerName,
      customerNumberOfStamp: data.customerNumberOfStamp,
      customerPhone: data.customerPhone,
      createMemberDate: new Date(data.createMemberDate), // แปลงเป็น Date object
    };
  }
  