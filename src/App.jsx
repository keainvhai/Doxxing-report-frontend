import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import SubmitReport from "./pages/SubmitReport";
import Search from "./pages/Search";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ReportDetails from "./pages/ReportDetails";
import ReportEdit from "./pages/ReportEdit";
import Register from "./pages/Register";
import { AuthContext } from "./helpers/AuthContext";
import axios from "axios";
import { useEffect, useState } from "react";
import Leaderboard from "./components/Leaderboard";
import Entities from "./pages/Entities";
import UserProfile from "./pages/UserProfile";
import UserReportEdit from "./pages/UserReportEdit";
import Summaries from "./pages/Summaries";
import SummariesDetails from "./pages/SummariesDetails";

function App() {
  const [authState, setAuthState] = useState({
    id: null,
    email: "",
    username: "",
    role: "",
    status: false,
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.log("🚨 未找到 accessToken，清空 authState");
        setAuthState({
          id: null,
          email: "",
          username: "",
          role: "",
          status: false,
        });
        localStorage.removeItem("user");
        localStorage.removeItem("authState"); // ✅ 确保 `authState` 也被清除
        return;
      }

      axios
        .get("http://localhost:3001/users/auth", { headers: { accessToken } })
        .then((response) => {
          console.log("📌 Auth API 响应:", response.data);
          if (
            !response.data ||
            response.data.success === false ||
            !response.data.user
          ) {
            console.warn("🚨 `Auth API` 失败，清空 authState");
            setAuthState({
              id: null,
              email: "",
              username: "",
              role: "",
              status: false,
            });
            localStorage.removeItem("user");
            localStorage.removeItem("authState"); // ✅ 确保 `authState` 也被清除
            return;
          }

          const user = response.data.user || {};
          console.log("📌 设置 authState:", user);

          // setAuthState({
          //   id: user.id || null,
          //   email: user.email || "",
          //   username:
          //     user.username || (user.email ? user.email.split("@")[0] : ""),
          //   role: user.role || "user",
          //   status: true,
          // });

          // localStorage.setItem("user", JSON.stringify(user));
          const newAuthState = {
            id: user.id || null,
            email: user.email || "",
            username:
              user.username || (user.email ? user.email.split("@")[0] : ""),
            role: user.role || "user",
            status: true,
          };

          setAuthState(newAuthState);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("authState", JSON.stringify(newAuthState)); // ✅ 存入 `authState`
        })
        .catch((error) => {
          console.error("🔴 Auth 检查失败:", error);
          setAuthState({
            id: null,
            email: "",
            username: "",
            role: "",
            status: false,
          });
          localStorage.removeItem("user");
        });
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/submit" element={<SubmitReport />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/report/:id" element={<ReportEdit />} />
          <Route path="/report/:id" element={<ReportDetails />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/entities" element={<Entities />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/report/user/update/:id" element={<UserReportEdit />} />
          <Route path="/summaries" element={<Summaries />} />
          <Route path="/summaries/:week_start" element={<SummariesDetails />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
