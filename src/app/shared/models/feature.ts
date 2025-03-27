export class Feature {
  id?: string;
  // tslint:disable-next-line:variable-name
  _id?: string;
  code?: string;
  title?: string;
  link?: string;
  subtitle?: string;
  order?: number;
  status?: string;
  type?: string;
  icon?: string;
  divider?: boolean;
  featuresIdParent?: Feature;
}
