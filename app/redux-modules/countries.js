import Config from 'react-native-config';
import { getLanguage } from 'helpers/language';
import CONSTANTS from 'config/constants';

// Actions
const GET_COUNTRIES = 'countries/GET_COUNTRIES';
const SET_LANGUAGE = 'countries/SET_LANGUAGE';

// Reducer
const initialState = {
  data: null,
  language: null
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_COUNTRIES:
      return Object.assign({}, state, { data: action.payload.data });
    case SET_LANGUAGE:
      return Object.assign({}, state, { language: action.payload.language });
    default:
      return state;
  }
}

// Action Creators
export function getCountries() {
  const currentLang = getLanguage();
  const nameColumnId = CONSTANTS.countries.nameColumn[currentLang] ||
    CONSTANTS.countries.nameColumn.en;

  const url = `${Config.API_PRODUCTION_URL}/query/${Config.DATASET_COUNTRIES}?sql=
    SELECT ${nameColumnId} as name, iso, centroid, bbox
    FROM gadm28_countries WHERE ${nameColumnId} != '' ORDER BY ${nameColumnId} ASC`;

  return (dispatch) => {
    fetch(url)
      .then(response => {
        if (response.ok) return response.json();
        throw Error(response.statusText);
      })
      .then((data) => {
        dispatch({
          type: GET_COUNTRIES,
          payload: data
        });
      })
      .catch((error) => {
        console.warn(error);
        // To-do
      });
  };
}

export function setLanguage(language) {
  return (dispatch) => {
    dispatch({
      type: SET_LANGUAGE,
      payload: language
    });
  }
}
