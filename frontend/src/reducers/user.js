import { GET_USERCOUNT, GET_USERS } from "../actions/types";

const initialState = {
  userCount: 0,
  users: null,
};

function userReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_USERCOUNT:
      return {
        ...state,
        userCount: payload,
      };
    case GET_USERS:
      return {
        ...state,
        userCount: payload.length,
        users: payload,
      };
    default:
      return state;
  }
}

export default userReducer;
