// src/routes/PrivateRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  let savedUser = null;
  try {
    const raw = localStorage.getItem("usuario");
    if (raw) savedUser = JSON.parse(raw);
  } catch (e) {
    console.error("Erro ao ler usuario do localStorage:", e);
  }

  const allowed = isAuthenticated || !!savedUser;

  console.log("PrivateRoute check =>", { isAuthenticated, user, savedUser });

  if (!allowed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
