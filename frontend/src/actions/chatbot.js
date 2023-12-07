import api from "../utils/api";
import { notification } from "antd";
import { GET_BOTS, GET_BOTCOUNT } from "./types";

// Get chatbots' count
export const getChatbotCount = () => async (dispatch) => {
  try {
    const res = await api.get("/chatbot/count");
    dispatch({ type: GET_BOTCOUNT, payload: res.data.data });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};

// Get chatbots' data
export const getChatbots = (data) => async (dispatch) => {
  try {
    const res = await api.post("/chatbot", data);
    dispatch({ type: GET_BOTS, payload: res.data.data });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};

// Add new chatbot
export const addChatbot = (data) => async (dispatch) => {
  try {
    const res = await api.post("/chatbot/create", data);
    dispatch({ type: GET_BOTS, payload: res.data.data });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};

// Update chatbot
export const updateChatbot = (data) => async (dispatch) => {
  try {
    const res = await api.post("/chatbot/update", data);
    dispatch({ type: GET_BOTS, payload: res.data.data });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};

// Delete chatbot
export const deleteChatbot = (data) => async (dispatch) => {
  try {
    const res = await api.post("/chatbot/delete", data);
    dispatch({ type: GET_BOTS, payload: res.data.data });
  } catch (err) {
    notification.warning({ message: err.response.data.message });
    throw err;
  }
};
