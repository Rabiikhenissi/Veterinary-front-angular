import { RefList } from '../models/ref-list';

export enum FeatureType {
  group = 'group',
  basic = 'basic',
  collapsable = 'collapsable',
}

export const listFeatureType: RefList<FeatureType>[] = [
  { key: FeatureType.group, value: 'group' },
  { key: FeatureType.basic, value: 'basic' },
  { key: FeatureType.collapsable, value: 'collapsable' },
];
