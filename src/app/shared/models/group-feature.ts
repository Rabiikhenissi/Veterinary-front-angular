import { Feature } from './feature';

export class GroupFeature {
  id?: string;
  // tslint:disable-next-line:variable-name
  _id?: string;
  featuresId?: Feature;
  status?: boolean;
  create?: boolean;
  read?: boolean;
  update?: boolean;
  delete?: boolean;
  list?: boolean;
  defaultFeature?: boolean;
}
