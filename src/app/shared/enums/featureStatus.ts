import { RefList } from '../models/ref-list';

export enum FeatureStatus {
  active = 'active',
  notActive = 'notActive',
}

export const listFeatureStatus: RefList<FeatureStatus>[] = [
  { key: FeatureStatus.active, value: 'active' },
  { key: FeatureStatus.notActive, value: 'not active' },
];
