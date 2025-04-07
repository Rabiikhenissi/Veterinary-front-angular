export class Appointment {
  _id?: string;
  userId: { _id: string; name: string };
  petId: { _id: string; name: string; species: string };
  companyId: string;
  date: string;
  time: string;
  status: string;
}