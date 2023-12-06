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
  }
};

// Get users' count
export const getUserCount = () => async (dispatch) => {
  try {
    const res = await api.get("/user/count");
    dispatch({ type: GET_USERCOUNT, payload: res.data.data });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
  }
};

// Get all users' data
export const getUsers = () => async (dispatch) => {
  try {
    const res = await api.get("/user");
    dispatch({ type: GET_USERS, payload: res.data.data });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
  }
};

// Update user's password
export const updatePwd = (password) => async (dispatch) => {
  try {
    const data = { password: password };
    const res = await api.post("/user/update", data);
    notification.success({ message: res.data.message });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
  }
};

// Delete user
export const deleteUser = (id) => async (dispatch) => {
  try {
    const data = { id: id };
    const res = await api.post("/user/delete", data);
    notification.success({ message: res.data.message });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
  }
};
