import { GET_DATASETS, GET_XMLLINKS } from "../actions/types";

const initialState = {
  datasets: null,
  xmlLinks: null,
};

function datasetReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_DATASETS:
      return {
        ...state,
        datasets: payload,
      };
    case GET_XMLLINKS:
      return {
        ...state,
        xmlLinks: payload,
      };
    default:
      return state;
  }
}

export default datasetReducer;
