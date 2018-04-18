// @flow
import type { Dispatch, GetState } from 'types/store.types';
import type { AppState, AppAction, CoordinatesValue } from 'types/app.types';

// $FlowFixMe
import { version } from 'package.json'; // eslint-disable-line
import { COORDINATES_FORMATS, ACTIONS_SAVED_TO_REPORT } from 'config/constants/index';
import { syncAreas } from 'redux-modules/areas';
import { syncCountries } from 'redux-modules/countries';
import { syncUser, LOGOUT_REQUEST } from 'redux-modules/user';
import { syncLayers } from 'redux-modules/layers';
import { syncReports } from 'redux-modules/reports';
import { syncAlerts } from 'redux-modules/alerts';
import takeRight from 'lodash/takeRight';

// Actions
const SET_LANGUAGE = 'app/SET_LANGUAGE';
export const SET_APP_SYNCED = 'app/SET_APP_SYNCED';
export const RETRY_SYNC = 'app/RETRY_SYNC';
const SET_COORDINATES_FORMAT = 'app/SET_COORDINATES_FORMAT';
const SET_LAYERS_DRAWER_SECTIONS = 'app/SET_LAYERS_DRAWER_SECTIONS';
const SET_PRISTINE_CACHE_TOOLTIP = 'app/SET_PRISTINE_CACHE_TOOLTIP';
export const SAVE_LAST_ACTIONS = 'app/SAVE_LAST_ACTIONS';

// Reducer
const initialState = {
  language: null,
  synced: false,
  coordinatesFormat: COORDINATES_FORMATS.decimal.value,
  showLegend: true,
  pristineCacheTooltip: true,
  actions: [],
  version // app cache invalidation depends on this, if this changes make sure that redux-persist invalidation changes also.
};

export default function reducer(state: AppState = initialState, action: AppAction) {
  switch (action.type) {
    case SET_LANGUAGE:
      return { ...state, language: action.payload };
    case SET_APP_SYNCED:
      return { ...state, synced: action.payload };
    case SET_COORDINATES_FORMAT:
      return { ...state, coordinatesFormat: action.payload };
    case SET_LAYERS_DRAWER_SECTIONS:
      return { ...state, showLegend: action.payload };
    case SET_PRISTINE_CACHE_TOOLTIP:
      return { ...state, pristineCacheTooltip: action.payload };
    case SAVE_LAST_ACTIONS: {
      // Save the last actions to send to the report
      const actions = [...takeRight(state.actions, ACTIONS_SAVED_TO_REPORT), action.payload];
      return { ...state, actions };
    }
    case LOGOUT_REQUEST:
      return initialState;
    default:
      return state;
  }
}

// Action Creators
export function setLanguage(language: string): AppAction {
  return {
    type: SET_LANGUAGE,
    payload: language
  };
}

export function setAppSynced(open: boolean): AppAction {
  return {
    type: SET_APP_SYNCED,
    payload: open
  };
}

export function syncApp() {
  return (dispatch: Dispatch, state: GetState) => {
    const { user } = state();
    dispatch(syncUser());
    if (user.loggedIn) {
      dispatch(syncCountries());
      dispatch(syncReports());
      dispatch(syncAreas());
      dispatch(syncAlerts());
      dispatch(syncLayers());
    }
  };
}

export function retrySync() {
  return (dispatch: Dispatch) => {
    dispatch({ type: RETRY_SYNC });
    dispatch(syncApp());
  };
}

export function setCoordinatesFormat(format: CoordinatesValue): AppAction {
  return {
    type: SET_COORDINATES_FORMAT,
    payload: format
  };
}

export function setPristineCacheTooltip(pristine: boolean): AppAction {
  return {
    type: SET_PRISTINE_CACHE_TOOLTIP,
    payload: pristine
  };
}
