export class Company {
  _id?: string;
  code?: string;
  name?: string;
  firstCalendarDay?: string;
  visitPrice?: number;
  latitude?: number;
  longitude?: number;
  services?: Service[];
  businessHours?:BusinessHour[];
archived?: boolean;}
export interface Service {
  name: string;
  price: number;
}
export interface BusinessHour {
  day: string;
  open: string;
  close: string;
  _id?:string
}