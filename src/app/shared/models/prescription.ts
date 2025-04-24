export interface Prescription {
    _id: string;
    appointmentId: string;
    companyId: string;
    userId: string;
    petId: string;
    medications: Medication[];
    pdf?: string; 

  }
  
  export interface Medication {
    productId: string;
    dosage?: string;
    instructions?: string;
  }