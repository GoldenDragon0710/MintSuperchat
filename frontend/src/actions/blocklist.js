import api from "../utils/api";
import { notification } from "antd";
import { GET_BLOCKLIST } from "./types";

// Get blocklist
export const getBlocklist = (data) => async (dispatch) => {
  try {
    const res = await api.post("/blocklist", data);
    dispatch({ type: GET_BLOCKLIST, payload: res.data.data });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};

// Add one number to blocklist
export const addBlocklist = (data) => async (dispatch) => {
  try {
    const res = await api.post("/blocklist/create", data);
    dispatch({ type: GET_BLOCKLIST, payload: res.data.data });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};

// Delete one number from blocklist
export const deleteBlocklist = (data) => async (dispatch) => {
  try {
    const res = await api.post("/blocklist/delete", data);
    dispatch({ type: GET_BLOCKLIST, payload: res.data.data });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};
