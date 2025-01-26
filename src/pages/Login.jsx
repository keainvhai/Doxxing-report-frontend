import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
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

  // ✅ 表单验证规则（Yup）
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const login = (values, { setSubmitting, setErrors }) => {
    axios
      .post("http://localhost:3001/users/login", values)
      .then((response) => {
        if (response.data.success) {
          // 存储 token
          localStorage.setItem("accessToken", response.data.token);
          setAuthState({
            email: values.email,
            role: response.data.role,
            status: true,
          });

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
            <Field
              type="password"
              name="password"
              placeholder="Enter your password"
            />
            <ErrorMessage name="password" component="div" className="error" />

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default Login;
