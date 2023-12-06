import { combineReducers } from "redux";
import auth from "./auth";
import chatbot from "./chatbot";
import user from "./user";
import phone from "./phone";
import blocklist from "./blocklist";
import dataset from "./dataset";

export default combineReducers({
  auth,
  chatbot,
  user,
  phone,
  blocklist,
  dataset,
});
