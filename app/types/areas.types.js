// @flow
import type { Template } from 'types/reports.types';
import type { RetrySync } from 'types/app.types';

export type Geostore = {
  geojson: Object,
  hash: string,
  provider: Object,
  areaHa: number,
  bbox: [number, number, number, number],
  lock: boolean,
  info: Object,
  id: string
}

export type Dataset = {
  slug: string,
  name: string,
  startDate: string,
  endDate: string,
  lastUpdate: number,
  _id: string,
  active: boolean,
  cache: boolean
}

export type Area = {
  id: string,
  name: string,
  application: string,
  geostore: Geostore,
  userId: string,
  createdAt: string,
  image: string,
  datasets: Array<Dataset>,
  use: Object,
  iso: Object,
  reportTemplate: Template
}

export type AreasState = {
  data: Array<Area>,
  selectedIndex: number,
  images: {},
  synced: boolean,
  syncing: boolean,
  refreshing: boolean,
  syncError: boolean,
  syncDate: number,
  pendingData: {
    image: {}
  }
};

export type AreasAction =
  | SaveAreaRequest
  | SaveAreaCommit
  | SaveAreaRollback
  | SetAreasRefreshing
  | GetAreasRequest
  | GetAreasCommit
  | GetAreasRollback
  | UpdateAreaRequest
  | UpdateAreaCommit
  | UpdateAreaRollback
  | RetrySync
  | UpdateIndex
  | DeleteAreaRequest;

// Actions
export type SaveAreaRequest = { type: 'areas/SAVE_AREA_REQUEST' };
export type SaveAreaCommit = { type: 'areas/SAVE_AREA_COMMIT', payload: { id: string } };
export type SaveAreaRollback = { type: 'areas/SAVE_AREA_ROLLBACK', payload: { id: string } };
export type SetAreasRefreshing = { type: 'areas/SET_AREAS_REFRESHING', payload: boolean };
export type GetAreasRequest = { type: 'areas/GET_AREAS_REQUEST' };
export type GetAreasCommit = { type: 'areas/GET_AREAS_COMMIT', payload: [Area] };
export type GetAreasRollback = { type: 'areas/GET_AREAS_ROLLBACK' };
export type UpdateAreaRequest = { type: 'areas/UPDATE_AREA_REQUEST', payload: Area };
export type UpdateAreaCommit = { type: 'areas/UPDATE_AREA_COMMIT', payload: Area };
export type UpdateAreaRollback = { type: 'areas/UPDATE_AREA_ROLLBACK', meta: Area };
export type DeleteAreaRequest = { type: 'areas/DELETE_AREA_REQUEST', payload: Area };
export type UpdateIndex = { type: 'areas/UPDATE_INDEX', payload: number };
