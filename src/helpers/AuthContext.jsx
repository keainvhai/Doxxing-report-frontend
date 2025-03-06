// import { createContext } from "react";

// export const AuthContext = createContext(null);
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    id: 0,
    email: "",
    username: "",
    role: "user",
    status: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const expiresAt = localStorage.getItem("expiresAt");

    if (token && expiresAt) {
      if (Date.now() > parseInt(expiresAt, 10)) {
        console.log("❌ Token expired, logging out...");
        handleLogout();
      } else {
        axios
          .get("http://localhost:3001/users/auth", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            if (response.data.success) {
              const user = response.data.user;
              setAuthState({
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                status: true,
              });
              console.log("✅ Auto login successful");
            } else {
              handleLogout();
            }
          })
          .catch(() => {
            handleLogout();
          });
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authState");
    localStorage.removeItem("token");
    localStorage.removeItem("expiresAt");
    setAuthState({
      id: 0,
      email: "",
      username: "",
      role: "user",
      status: false,
    });
    console.log("✅ Logged out");
  };

  return (
    <AuthContext.Provider value={{ authState, setAuthState, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
