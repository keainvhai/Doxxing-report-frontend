import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import "../styles/Login.css";

function Login() {
  const { setAuthState } = useContext(AuthContext);
  const navigate = useNavigate();

  const initialValues = {
    email: "",
    password: "",
  };
  const [showToast, setShowToast] = useState(false); // ✅ 控制 Toast 状态
  const [toastMessage, setToastMessage] = useState(""); // ✅ 动态设置 Toast 消息
  const [toastType, setToastType] = useState("success"); // ✅ 记录 Toast 类型
  const [showPassword, setShowPassword] = useState(false); // ✅ 控制密码可见性

  // ✅ 表单验证规则（Yup）
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const login = (values, { setSubmitting, setErrors }) => {
    axios
      .post(
        `${import.meta.env.VITE_API_URL}/users/login`, // ✅ 动态环境变量
        values,
        {
          withCredentials: true, // ✅ 如果后端有 JWT 验证或 Cookie
        }
      )
      .then((response) => {
        console.log("📌 Login Response:", response.data);
        if (response.data.success && response.data.token) {
          // 记录 token 和过期时间：
          const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2小时有效期

          const userData = {
            id: response.data.id,
            email: response.data.email,
            username:
              response.data.username || response.data.email.split("@")[0],
            role: response.data.role,
            status: true,
          };

          // ✅ 存入 authState
          setAuthState(userData);

          localStorage.setItem("authState", JSON.stringify(userData));
          localStorage.setItem("token", response.data.token); // ✅ 存入 accessToken
          localStorage.setItem("expiresAt", expiresAt);

          // ✅ 先显示 Toast
          setToastMessage("✅ Login successful! Redirecting...");
          setToastType("success");
          setShowToast(true);

          // ✅ 3 秒后跳转到主页 `/`
          setTimeout(() => {
            setShowToast(false);
            navigate("/");
          }, 3000);
        }
      })
      .catch((error) => {
        console.error("Login Error:", error.response?.data);

        if (error.response) {
          const errorMsg = error.response.data?.error || "Unknown error";

          if (error.response.status === 401) {
            // 🔹 如果是 401（未授权），显示错误
            setErrors({ email: errorMsg });
          } else {
            // ✅ 显示错误 Toast
            setToastMessage(`❌ ${errorMsg}`);
            setToastType("error");
            setShowToast(true);

            setTimeout(() => setShowToast(false), 3000);
          }
        } else {
          setToastMessage("❌ Server error, please try again later.");
          setToastType("error");
          setShowToast(true);

          setTimeout(() => setShowToast(false), 3000);
        }
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div className="loginContainer">
      {/* ✅ Toast Notification */}
      {showToast && <div className={`toast ${toastType}`}>{toastMessage}</div>}

      <h2>Login</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={login}
      >
        {({ isSubmitting }) => (
          <Form>
            <label>Email:</label>
            <Field type="email" name="email" placeholder="Enter your email" />
            <ErrorMessage name="email" component="div" className="error" />

            <label>Password:</label>
            <div className="password-container">
              <Field
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <ErrorMessage name="password" component="div" className="error" />

            <button className="login-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
            <button
              className="forgot-btn"
              onClick={() => navigate("/reset-password")}
            >
              Forgot Password
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default Login;
