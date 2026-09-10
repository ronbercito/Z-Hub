/**
 * Archivo: frontend/src/context/AuthContext.js
 * Función: Contexto global de autenticación. La sesión persistente se apoya en la cookie
 *          httpOnly del backend; el JWT de compatibilidad solo vive en memoria durante
 *          la sesión actual y ya no se guarda en localStorage.
 * Trabaja con: backend/app/routers/auth/router.py (/api/auth/login, /me, /logout), App.js, todos los modules/*
 */
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  const API = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;

  // Limpieza de la clave histórica: desde 1.2.37 la sesión no depende de localStorage.
  useEffect(() => {
    localStorage.removeItem("fibraz_token");
  }, []);

  // Si el backend responde 401 (sesión inválida/expirada) se limpia la sesión en memoria.
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error?.response?.status === 401 && !String(error?.config?.url || "").includes("/auth/login")) {
          localStorage.removeItem("fibraz_token");
          setUser(false);
          setToken("");
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${API}/auth/me`, { withCredentials: true });
        setUser(res.data.user);
      } catch (e) {
        setUser(false);
        setToken("");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [API]);

  const login = async (email, password) => {
    const res = await axios.post(
      `${API}/auth/login`,
      { email, password },
      { withCredentials: true }
    );
    const { token: newToken, user: userData } = res.data;
    // Compatibilidad con componentes que aún construyen Authorization: Bearer <token>.
    // El valor solo se conserva en memoria; tras recargar, la cookie httpOnly autentica la sesión.
    setToken(newToken || "");
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch (e) {}
    localStorage.removeItem("fibraz_token");
    setUser(false);
    setToken("");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, API }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
