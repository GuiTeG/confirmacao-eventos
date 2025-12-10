// src/context/AuthContext.jsx
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// Usa variável de ambiente se existir (Vercel),
// senão cai no backend da Render como padrão.
const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "https://confirmacao-eventos.onrender.com";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("usuario");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!user;

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha: password }),
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE ->", res.status, data);

      if (!res.ok) {
        return {
          success: false,
          message: data.error || "Erro ao fazer login",
        };
      }

      setUser(data.usuario);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      return { success: true, user: data.usuario };
    } catch (err) {
      console.error("Erro no login:", err);
      return {
        success: false,
        message: "Erro de conexão com o servidor",
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: name, email, senha: password }),
      });

      const data = await res.json();
      console.log("REGISTER RESPONSE ->", res.status, data);

      if (!res.ok) {
        return {
          success: false,
          message: data.error || "Erro ao criar conta",
        };
      }

      const usuario = data.usuario || { id: data.id, nome: name, email };

      setUser(usuario);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      return { success: true, user: usuario };
    } catch (err) {
      console.error("Erro no cadastro:", err);
      return {
        success: false,
        message: "Erro de conexão com o servidor",
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("usuario");
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
