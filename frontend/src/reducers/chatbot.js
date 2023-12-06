import { GET_BOTCOUNT, GET_BOTS } from "../actions/types";

const initialState = {
  botCount: 0,
  bots: null,
};

function chatbotReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_BOTCOUNT:
      return {
        ...state,
        botCount: payload,
      };
    case GET_BOTS:
      return {
        ...state,
        botCount: payload.length,
        bots: payload,
      };
    default:
      return state;
  }
}

export default chatbotReducer;
