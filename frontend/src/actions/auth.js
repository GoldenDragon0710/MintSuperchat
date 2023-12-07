import api from "../utils/api";
import { notification } from "antd";
import { USER_LOADED, LOGIN_SUCCESS, LOGOUT } from "./types";

// Load User
export const loadUser = () => async (dispatch) => {
  try {
    const res = await api.get("/auth");
    dispatch({
      type: USER_LOADED,
      payload: res.data,
    });
  } catch (err) {
    throw err;
  }
};

// Login User
export const login = (data) => async (dispatch) => {
  try {
    const res = await api.post("/auth", data);
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};

// Logout
export const logout = () => async (dispatch) => {
  // Remove token from local storage
  localStorage.clear();
  // Set current user to empty object {} which will set isAuthenticated to false
  dispatch({ type: LOGOUT });
};
