import api from "../utils/api";
import { notification } from "antd";
import { GET_DATASETS, GET_XMLLINKS } from "./types";

// Get datasets
export const getDatasets = (data) => async (dispatch) => {
  try {
    const res = await api.post("/dataset", data);
    dispatch({ type: GET_DATASETS, payload: res.data.data });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};

// Delete datasets
export const deleteDatasets = (data) => async (dispatch) => {
  try {
    const res = await api.post("/dataset/delete", data);
    dispatch({ type: GET_DATASETS, payload: res.data.data });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};

// train datasets
export const trainDatasets = (data) => async (dispatch) => {
  try {
    const res = await api.post("/dataset/train", data, {
      headers: {
        "content-type": "multipart/form-data",
      },
    });
    dispatch({ type: GET_DATASETS, payload: res.data.data });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};

// get SitemapXML
export const getsitemapXML = (data) => async (dispatch) => {
  try {
    const res = await api.post("/dataset/getsitemapXML", data);
    dispatch({ type: GET_XMLLINKS, payload: res.data.data });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};
