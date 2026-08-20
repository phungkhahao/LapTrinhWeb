import { createContext, useContext, useEffect, useState } from "react";
import { getThongTinTaiKhoan, postDangXuat } from "../api/hotel_booking_api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const refreshUser = async () => {
    try {
      const r = await getThongTinTaiKhoan();
      setUser(r.data);
      return r.data;
    } catch {
      localStorage.removeItem("hotel_booking_token");
      setUser(null);
      return null;
    } finally {
      setLoadingAuth(false);
    }
  };
  useEffect(() => {
    if (localStorage.getItem("hotel_booking_token")) refreshUser();
    else setLoadingAuth(false);
  }, []);
  const login = (token, u) => {
    localStorage.setItem("hotel_booking_token", token);
    setUser(u);
  };
  const logout = async () => {
    try {
      await postDangXuat();
    } catch {}
    localStorage.removeItem("hotel_booking_token");
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loadingAuth,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
