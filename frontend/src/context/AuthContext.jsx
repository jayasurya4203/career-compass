import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { loadStoredToken, setToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      loadStoredToken();
      try {
        const { data } = await api.get("/profile");
        if (!cancelled && data?.id) {
          setStudent({ id: data.id, name: data.profile?.name, email: data.profile?.email });
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
    const { data } = await api.post("/login", { email, password });
    setToken(data.token);
    setStudent(data.student);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/register", payload);
    setToken(data.token);
    setStudent(data.student);
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
