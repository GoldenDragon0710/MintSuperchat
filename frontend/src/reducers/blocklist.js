import { GET_BLOCKLIST } from "../actions/types";

const initialState = {
  blocklist: null,
};

function blocklistReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_BLOCKLIST:
      return {
        ...state,
        blocklist: payload,
      };
    default:
      return state;
  }
}

export default blocklistReducer;
