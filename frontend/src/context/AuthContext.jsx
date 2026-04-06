import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { loadStoredToken, setToken } from "../api";

const AuthContext = createContext(null);

function mapUser(u) {
  if (!u) return null;
  return { id: u.id, name: u.username, email: u.email };
}

export function AuthProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      loadStoredToken();
      try {
        const { data } = await api.get("/auth/me");
        if (!cancelled && data?.id) {
          setStudent(mapUser(data));
        }
      } catch {
        if (!cancelled) setStudent(null);
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.token);
    setStudent(mapUser(data.user));
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    setToken(data.token);
    setStudent(mapUser(data.user));
    return data;
  };

  const logout = () => {
    setToken(null);
    setStudent(null);
  };

  const value = useMemo(
    () => ({ student, login, register, logout, booting }),
    [student, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
