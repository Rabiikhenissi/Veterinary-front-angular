export class Appointment {
  _id?: string;
  userId: { _id: string; name: string };
  petId: { _id: string; name: string; species: string; icon: string };
  companyId: string;
  date: string;
  time: string;
  status: string;
  medications?: string[];
  weight?: number;       
  height?: number;   
  temperature?: number;  
  heartRate?: number;   
  symptoms?: string[];   
  performedProcedures?: string[]; 
  nextAppointment?: string; 
  prescriptionId?: string;
}

// export class Appointment {
//   _id?: string;
//   companyId: string;
//   userId: {
//     _id: string;
//     name: string;
//   };
//   petId: {
//     _id: string;
//     name: string;
//     species: string;
//     icon: string;
//   };
//   date: string;
//   time: string;
//   status: 'pending' | 'confirmed';
//   archived?: boolean;
//   symptoms?: string[];
//   performedProcedures?: string[];
//   medications?: {
//     _id: string;
//     name?: string; 
//   }[];
//   weight?: string;
//   temperature?: string;
//   heartRate?: string;
//   prescriptionId?: {
//     _id: string;
//     appointmentId: string;
//     companyId: string;
//     userId: string;
//     petId: string;
//     medications: {
//       productId: {
//         _id: string;
//         name?: string;
//       };
//       dosage: string;
//       instructions: string;
//     }[]; pdf?: any; // Buffer or base64 string depending on your backend response
//     createdAt?: string;
//     updatedAt?: string;
//   };

//   invoiceId?: {
//     _id: string;
//     companyId: string;
//     userId: string;
//     petId: string;
//     date: string;
//     time: string;
//     status: 'pending' | 'confirmed';
//     archived?: boolean;
//     symptoms?: string;
//     diagnosis?: string;
//     weight?: string;
//     temperature?: string;
//     heartRate?: string;
//     prescriptionId?: string;
//     invoiceId?: string;
//     nextAppointment?: string;
//     createdAt?: string;
//     updatedAt?: string;
//   };

//   nextAppointment?: string; 
//   createdAt?: string;
//   updatedAt?: string;
// }
export class Appointment2 {
  _id?: string;
  userId: string ;
  petId:  string ;
  companyId: string;
  date: string;
  time: string;
  status: string;
}