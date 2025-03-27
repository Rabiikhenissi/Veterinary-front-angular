import { Group } from './group';
import {Company} from "./company";

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
}

export class ResToken {
  token?: string;
}
