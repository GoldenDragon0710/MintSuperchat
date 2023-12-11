import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export function Layout() {
  const auth = useSelector((state) => state.auth);
  const token = localStorage.getItem("token");
  const [isView, setIsView] = useState(false);

  useEffect(() => {
    if (auth.user && auth.user.userType == process.env.isClient) {
      setIsView(true);
    }
  }, []);

  return <div>{token && isView ? <Outlet /> : <Navigate to="/login" />}</div>;
}

export default Layout;
