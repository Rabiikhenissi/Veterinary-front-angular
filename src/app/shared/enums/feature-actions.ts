import { RefList } from '../models/ref-list';

export enum FeatureActions {
  list = 'list',
  create = 'create',
  read = 'read',
  update = 'update',
  delete = 'delete',
}

export const listFeatureActions: RefList<FeatureActions>[] = [
  { key: FeatureActions.list, value: 'List' },
  { key: FeatureActions.create, value: 'Create' },
  { key: FeatureActions.read, value: 'Read' },
  { key: FeatureActions.update, value: 'Update' },
  { key: FeatureActions.delete, value: 'Delete' },
];
