import { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import logoImage from "../assets/logo2.png";
import { AuthContext } from "../helpers/AuthContext";

const Navbar = () => {
  const { authState, setAuthState, handleLogout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  // ✅ 读取 localStorage 里的 authState（防止刷新丢失）
  useEffect(() => {
    const storedAuth = localStorage.getItem("authState");
    if (storedAuth) {
      console.log("🔄 读取 localStorage.authState:", JSON.parse(storedAuth));
      setAuthState(JSON.parse(storedAuth));
    } else {
      console.log("⚠️ 没有找到 authState，设置为未登录");

      setAuthState({
        id: null,
        email: "",
        username: "",
        role: "",
        status: false,
      });
    }
  }, []);

  // useEffect(() => {
  //   console.log("📌 Navbar - 当前用户权限:", authState);
  // }, [authState]);

  // ✅ 监听点击事件，判断是否点击到菜单外部
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 如果点击的是菜单按钮，不关闭菜单
      if (buttonRef.current && buttonRef.current.contains(event.target)) {
        return;
      }

      // 如果点击的是菜单外部，关闭菜单
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // const logout = () => {
  //   localStorage.removeItem("authState"); // ✅ 删除 authState
  //   localStorage.removeItem("user"); // ✅ 额外删除 user
  //   localStorage.removeItem("accessToken"); // ✅ 额外删除 accessToken

  //   setAuthState({
  //     id: null,
  //     email: "",
  //     username: "",
  //     role: "",
  //     status: false,
  //   });

  //   console.log("📌 用户已登出，authState 变为:", authState);
  //   navigate("/login");
  // };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <img src={logoImage} alt="Logo" className="logo-image" />
      </Link>
      <button
        ref={buttonRef}
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>
      <div ref={menuRef} className={`nav-links ${menuOpen ? "show" : ""}`}>
        <Link to="/search" onClick={() => setMenuOpen(false)}>
          Search
        </Link>

        <Link to="/data" onClick={() => setMenuOpen(false)}>
          Data
        </Link>

        <Link to="/leaderboard" onClick={() => setMenuOpen(false)}>
          Leaderboard
        </Link>
        <Link to="/entities" onClick={() => setMenuOpen(false)}>
          Entities
        </Link>

        <Link to="/summaries" onClick={() => setMenuOpen(false)}>
          Weekly Summary
        </Link>

        <Link to="/submit" onClick={() => setMenuOpen(false)}>
          Submit Report
        </Link>

        {/* ✅ 仅登录用户可见 */}
        {authState.status && (
          <Link to="/profile" onClick={() => setMenuOpen(false)}>
            My Profile
          </Link>
        )}

        {!authState.status ? (
          <>
            <Link to="/register" onClick={() => setMenuOpen(false)}>
              Register
            </Link>
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              Login
            </Link>
          </>
        ) : (
          <>
            {/* ✅ 如果是管理员，显示 Admin 选项 */}
            {authState.role === "admin" && (
              <Link to="/admin" onClick={() => setMenuOpen(false)}>
                Admin
              </Link>
            )}
            {/* ✅ 显示用户名 + 退出按钮 */}
            {/* <span className="user-email">{authState.email}</span> */}
            <Link to="#" onClick={handleLogout}>
              Logout
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
