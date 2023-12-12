import api from "../utils/api";
import { notification } from "antd";
import { GET_PHONES, GET_PHONECOUNT } from "./types";

// Get all phones' count
export const getPhoneCount = () => async (dispatch) => {
  try {
    const res = await api.get("/phone/count");
    dispatch({ type: GET_PHONECOUNT, payload: res.data.data });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};

// Get phones' data
export const getPhones = (data) => async (dispatch) => {
  try {
    const res = await api.post("/phone", data);
    dispatch({ type: GET_PHONES, payload: res.data.data });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};

// Delete phone
export const deletePhone = (data) => async (dispatch) => {
  try {
    const res = await api.post("/phone/delete", data);
    dispatch({ type: GET_PHONES, payload: res.data.data });
    notification.success({ message: "Successfully deleted" });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};
