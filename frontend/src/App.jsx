import React, { useEffect } from "react";
import { useRoutes } from "react-router-dom";
import routes from "@/routes";
import { Navbar } from "./widgets/navbar";
import { LOGOUT } from "./actions/types";

// Redux
import { Provider } from "react-redux";
import store from "./store";
import { loadUser } from "./actions/auth";
import setAuthToken from "./utils/setAuthToken";

function App() {
  const pages = useRoutes(routes);
  useEffect(() => {
    // check for token in LS when app first runs
    if (localStorage.token) {
      // if there is a token set axios headers for all requests
      setAuthToken(localStorage.token);
      store.dispatch(loadUser());
    }
    // try to fetch a user, if no token or invalid token we
    // will get a 401 response from our API

    // log user out from all tabs if they log out in one tab
    window.addEventListener("storage", () => {
      if (!localStorage.token) store.dispatch({ type: LOGOUT });
    });
  }, []);

  return (
    <Provider store={store}>
      <div className="absolute z-10 w-full border-b-2 border-[#1744831A] bg-white">
        <Navbar />
      </div>
      <div className={`bg-custom-background bg-cover bg-center`}>{pages}</div>
    </Provider>
  );
}

export default App;
