import { GET_PHONECOUNT, GET_PHONES } from "../actions/types";

const initialState = {
  phoneCount: 0,
  phones: null,
};

function phoneReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_PHONECOUNT:
      return {
        ...state,
        phoneCount: payload,
      };
    case GET_PHONES:
      return {
        ...state,
        phoneCount: payload.length,
        phones: payload,
      };
    default:
      return state;
  }
}

export default phoneReducer;
