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

function App() {
  const [authState, setAuthState] = useState({
    email: "",
    role: "",
    status: false,
  });

  useEffect(() => {
    axios
      .get("http://localhost:3001/users/auth", {
        headers: { accessToken: localStorage.getItem("accessToken") },
      })
      .then((response) => {
        if (response.data.error) {
          setAuthState({ email: "", role: "", status: false });
        } else {
          setAuthState({
            email: response.data.email,
            role: response.data.role,
            status: true,
          });
        }
      });
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
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
