import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export function AdminLayout() {
  const auth = useSelector((state) => state.auth);
  const token = localStorage.getItem("token");

  return (
    <div>
      {token ? (
        auth.user && auth.user.userType == process.env.isAdmin && <Outlet />
      ) : (
        <Navigate to="/admin/login" />
      )}
    </div>
  );
}

export default AdminLayout;
