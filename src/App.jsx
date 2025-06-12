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
import { AuthProvider } from "./helpers/AuthContext"; // ✅ 用 AuthProvider
import Leaderboard from "./pages/Leaderboard";
import Entities from "./pages/Entities";
import UserProfile from "./pages/UserProfile";
import UserReportEdit from "./pages/UserReportEdit";
import Summaries from "./pages/Summaries";
import SummariesDetails from "./pages/SummariesDetails";
import AboutUs from "./pages/AboutUs";
import Footer from "./components/Footer";
import Data from "./pages/Data";
import ResetPassword from "./pages/ResetPassword";
import PublicUserProfile from "./pages/PublicUserProfile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // 样式很重要，记得一起引入
import Statistic from "./pages/Statistic";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="page-wrapper">
          <Navbar />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/submit" element={<SubmitReport />} />
              <Route path="/search" element={<Search />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/report/:id" element={<ReportEdit />} />
              <Route path="/report/:id" element={<ReportDetails />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/entities" element={<Entities />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route
                path="/report/user/update/:id"
                element={<UserReportEdit />}
              />
              <Route path="/summaries" element={<Summaries />} />
              <Route
                path="/summaries/:week_start"
                element={<SummariesDetails />}
              />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/data" element={<Data />} />
              <Route path="/statistic" element={<Statistic />} />
              <Route path="/user/:id" element={<PublicUserProfile />} />
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} />
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
