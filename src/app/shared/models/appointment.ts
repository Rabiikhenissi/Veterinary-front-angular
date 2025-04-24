export class Appointment {
  _id?: string;
  userId: { _id: string; name: string };
  petId: { _id: string; name: string; species: string; icon: string };
  companyId: string;
  date: string;
  time: string;
  status: string;
  medications?: string[];
}
export class Appointment2 {
  _id?: string;
  userId: string ;
  petId:  string ;
  companyId: string;
  date: string;
  time: string;
  status: string;
}