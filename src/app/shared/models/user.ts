import { Group } from './group';
import {Company} from "./company";
import { Pet } from './pet';

export class User {
  id?: string;
  // tslint:disable-next-line:variable-name
  _id?: string;
  companyId: Company;
  name?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  password?: string;
  groupsId?: Group;
  petId?:Pet[];
  type?:string;
  archived?: boolean;
}

export class ResToken {
  token?: string;
}
