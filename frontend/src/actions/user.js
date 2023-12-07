import api from "../utils/api";
import { notification } from "antd";
import { GET_USERS, GET_USERCOUNT } from "./types";

// Register User
export const register = (data) => async (dispatch) => {
  try {
    const res = await api.post("/user", data);
    notification.success({ message: res.data.message });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};

// Get users' count
export const getUserCount = () => async (dispatch) => {
  try {
    const res = await api.get("/user/count");
    dispatch({ type: GET_USERCOUNT, payload: res.data.data });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};

// Get all users' data
export const getUsers = () => async (dispatch) => {
  try {
    const res = await api.get("/user");
    dispatch({ type: GET_USERS, payload: res.data.data });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};

// Update user's password
export const updatePwd = (data) => async (dispatch) => {
  try {
    // const data = { password: password };
    const res = await api.post("/user/update", data);
    notification.success({ message: res.data.message });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};

// Delete user
export const deleteUser = (data) => async (dispatch) => {
  try {
    const res = await api.post("/user/delete", data);
    notification.success({ message: res.data.message });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};
