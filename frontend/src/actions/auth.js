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
    console.log(err);
  }
};

// Login User
export const login = (email, password) => async (dispatch) => {
  const body = { email, password };
  try {
    const res = await api.post("/auth", body);
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    });
    localStorage.setItem(
      "userType",
      res.data.user.userType ? "admin" : "client"
    );

    notification.success({ message: "Welcome to Mint Superchat" });
    return res.status;
  } catch (err) {
    notification.warning({ message: err.response.data.message });
  }
};

// Logout
export const logout = () => async (dispatch) => {
  // Remove token from local storage
  localStorage.clear();
  // Set current user to empty object {} which will set isAuthenticated to false
  dispatch({ type: LOGOUT });
};
