export class Company {
  _id?: string;
  code?: string;
  name?: string;
  firstCalendarDay?: string;
  visitPrice?: number;
  latitude?: number;
  longitude?: number;
  services?: Service[];
archived?: boolean;}
export interface Service {
  name: string;
  price: number;
}