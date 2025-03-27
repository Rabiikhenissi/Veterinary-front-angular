import { RefList } from '../models/ref-list';

export enum FeatureCodes {
  setting = 'setting',
  administration = 'administration',
  companies = 'companies',
  company = 'company',
  features = 'features',
  groups = 'groups',
  users = 'users',
  paramProject = 'param-project',
  account = 'account',
  profile = 'profile',
  userFeatures = 'user-features',
  clients = 'clients',
  pages = 'pages',
  texts = 'texts',
  excursions = 'excursions',
}

export const listFeatureActions: RefList<FeatureCodes>[] = [
  { key: FeatureCodes.setting, value: 'Setting' },
  { key: FeatureCodes.pages, value: 'Pages' },
  { key: FeatureCodes.texts, value: 'Texts' },
  { key: FeatureCodes.excursions, value: 'Excursions' },
  { key: FeatureCodes.clients, value: 'Clients' },
  { key: FeatureCodes.administration, value: 'Administration' },
  { key: FeatureCodes.companies, value: 'Companies' },
  { key: FeatureCodes.company, value: 'Company' },
  { key: FeatureCodes.features, value: 'Features' },
  { key: FeatureCodes.groups, value: 'Groups' },
  { key: FeatureCodes.users, value: 'Users' },
  { key: FeatureCodes.paramProject, value: 'Params Project' },
  { key: FeatureCodes.account, value: 'Account' },
  { key: FeatureCodes.profile, value: 'Profile' },
  { key: FeatureCodes.userFeatures, value: 'user-features' },
];
