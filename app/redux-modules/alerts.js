import Config from 'react-native-config';
import moment from 'moment';
import memoize from 'lodash/memoize';
import omit from 'lodash/omit';
import { pointsToGeoJSON } from 'helpers/map';
import { initDb, read } from 'helpers/database';
import { activeDataset, getSupportedDatasets } from 'helpers/area';
import { getActionsTodoCount } from 'helpers/sync';
import CONSTANTS from 'config/constants';

// Actions
import { LOGOUT_REQUEST } from 'redux-modules/user';
import { UPLOAD_REPORT_COMMIT } from 'redux-modules/reports';
import { GET_AREA_COVERAGE_COMMIT } from 'redux-modules/areas';

const d3Dsv = require('d3-dsv');

const SET_CAN_DISPLAY_ALERTS = 'alerts/SET_CAN_DISPLAY_ALERTS';
const SET_ACTIVE_ALERTS = 'alerts/SET_ACTIVE_ALERTS';
const GET_ALERTS_REQUEST = 'areas/GET_ALERTS_REQUEST';
export const GET_ALERTS_COMMIT = 'areas/GET_ALERTS_COMMIT';
const GET_ALERTS_ROLLBACK = 'areas/GET_ALERTS_ROLLBACK';

const supercluster = require('supercluster');

// TODO: refactor activeCluster into a helper class
function createCluster(data) {
  const cluster = supercluster({
    radius: 120,
    maxZoom: 16, // Default: 16,
    nodeSize: 128
  });
  cluster.load(data.features);
  return cluster;
}

export const activeCluster = {
  supercluster: null
};

function mapAreaToClusters(areaId, datasetSlug, startDate) {
  const realm = initDb();
  const timeFrame = datasetSlug === CONSTANTS.datasets.VIIRS ? 'day' : 'month';
  const limitRange = moment().subtract(startDate, timeFrame).valueOf();
  const alerts = read(realm, 'Alert')
    .filtered(`areaId = '${areaId}' AND slug = '${datasetSlug}' AND date > '${limitRange}'`);
  const activeAlerts = pointsToGeoJSON(alerts);
  return createCluster(activeAlerts);
}

memoize.Cache = Map;
const memoizedAreaToClusters = memoize(mapAreaToClusters, (...rest) => rest.join('_'));

// Reducer
const initialState = {
  cache: {},
  reported: [],
  canDisplayAlerts: true,
  clusters: null,
  pendingData: {}
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_CAN_DISPLAY_ALERTS:
      return { ...state, canDisplayAlerts: action.payload };
    case SET_ACTIVE_ALERTS:
      return { ...state, clusters: action.payload };
    case UPLOAD_REPORT_COMMIT: {
      const { alerts } = action.meta.report;
      let reported = [...state.reported];

      if (alerts && alerts.length) {
        alerts.forEach((alert) => {
          reported = [...reported, `${alert.lon}${alert.lat}`];
        }, this);
      }
      return { ...state, reported };
    }
    case GET_AREA_COVERAGE_COMMIT: {
      const { area } = action.meta;
      const datasets = getSupportedDatasets(action.payload);
      let pendingData = { ...state.pendingData };
      if (datasets && datasets.length) {
        datasets.forEach((dataset) => {
          const datasetSlug = dataset.slug;
          pendingData = {
            ...pendingData,
            [datasetSlug]: {
              ...pendingData[datasetSlug],
              [area.id]: false
            }
          };
        });
      }
      return { ...state, pendingData };
    }
    case GET_ALERTS_REQUEST: {
      const { area, datasetSlug } = action.payload;
      const pendingData = {
        ...state.pendingData,
        [datasetSlug]: {
          ...state.pendingData[datasetSlug],
          [area.id]: true
        }
      };
      return { ...state, pendingData };
    }
    case GET_ALERTS_COMMIT: {
      const { area, datasetSlug } = action.meta;
      const pendingData = {
        ...state.pendingData,
        [datasetSlug]: omit(state.pendingData[datasetSlug], [area.id])
      };
      const cache = {
        ...state.cache,
        [datasetSlug]: {
          ...state.cache[datasetSlug],
          [area.id]: Date.now()
        }
      };
      saveAlertsToDb(area.id, datasetSlug, action.payload);
      return { ...state, pendingData, cache };
    }
    case GET_ALERTS_ROLLBACK: {
      const { area, datasetSlug } = action.meta;
      const pendingData = {
        ...state.pendingData,
        [datasetSlug]: {
          ...state.pendingData[datasetSlug],
          [area.id]: false
        }
      };
      return { ...state, pendingData };
    }
    case LOGOUT_REQUEST: {
      resetAlertsDb();
      return initialState;
    }
    default:
      return state;
  }
}

// Helpers
function getAreaById(areas, areaId) {
  // Using deconstructor to generate a new object
  return { ...areas.find((areaData) => (areaData.id === areaId)) };
}

export function saveAlertsToDb(areaId, slug, alerts) {
  if (alerts && alerts.length > 0) {
    const realm = initDb();
    const existingAlerts = realm.objects('Alert').filtered(`areaId = '${areaId}' AND slug = '${slug}'`);
    try {
      realm.write(() => {
        realm.delete(existingAlerts);
      });
    } catch (e) {
      console.warn('Error cleaning db', e);
    }
    const alertsArray = d3Dsv.csvParse(alerts);
    realm.write(() => {
      alertsArray.forEach((alert) => {
        realm.create('Alert', {
          slug,
          areaId,
          date: parseInt(alert.date, 10),
          lat: parseFloat(alert.lat, 10),
          long: parseFloat(alert.lon, 10)
        });
      });
    });
  }
}

export function resetAlertsDb() {
  const realm = initDb();
  realm.write(() => {
    const allAlerts = realm.objects('Alert');
    realm.delete(allAlerts);
  });
}


// Action Creators
export function setCanDisplayAlerts(canDisplay) {
  return {
    type: SET_CAN_DISPLAY_ALERTS,
    payload: canDisplay
  };
}

export function setActiveAlerts() {
  return (dispatch, state) => {
    const areas = state().areas;
    const index = areas.selectedIndex;
    const area = areas.data[index] || null;
    const dataset = activeDataset(area);
    const datasetSlug = dataset.slug;
    const canDisplay = state().alerts.canDisplayAlerts;

    const action = { type: SET_ACTIVE_ALERTS, payload: null };
    if (datasetSlug && canDisplay) {
      activeCluster.supercluster = memoizedAreaToClusters(area.id, datasetSlug, dataset.startDate);
      action.payload = `${area.id}_${datasetSlug}_${dataset.startDate}`;
      if (memoizedAreaToClusters.cache.size > 3) {
        const first = memoizedAreaToClusters.cache.keys().next().value;
        memoizedAreaToClusters.cache.delete(first);
      }
    }
    dispatch(action);
  };
}

export function getAreaAlerts(areaId, datasetSlug) {
  return (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    // TODO GET THE RANGE FROM THE CACHE OR GET THE DEFAULT ONE
    const range = CONSTANTS.areas.alertRange[datasetSlug];
    if (range) {
      const url = `${Config.API_URL}/fw-alerts/${datasetSlug}/${area.geostore}?range=${range}&output=csv`;
      dispatch({
        type: GET_ALERTS_REQUEST,
        payload: { area, datasetSlug },
        meta: {
          offline: {
            effect: { url, deserialize: false },
            commit: { type: GET_ALERTS_COMMIT, meta: { area, datasetSlug } },
            rollback: { type: GET_ALERTS_ROLLBACK, meta: { area, datasetSlug } }
          }
        }
      });
    } else {
      console.warn('Error getting the default range for alerts request');
    }
  };
}

export function syncAlerts() {
  return (dispatch, state) => {
    const { pendingData } = state().alerts;
    if (getActionsTodoCount(pendingData) > 0) {
      Object.keys(pendingData).forEach((dataset) => {
        const syncingAlertsData = pendingData[dataset];
        const canDispatch = id => (typeof syncingAlertsData[id] !== 'undefined' && syncingAlertsData[id] === false);
        Object.keys(syncingAlertsData).forEach(id => {
          if (canDispatch(id)) {
            dispatch(getAreaAlerts(id, dataset));
          }
        });
      });
    }
  };
}

