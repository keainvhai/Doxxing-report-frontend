import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import zxcvbn from "zxcvbn"; // ✅ 引入密码强度检测库
import { FaEye, FaEyeSlash } from "react-icons/fa";

import "../styles/Register.css";

function Register() {
  const initialValues = {
    email: "",
    password: "",
  };

  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false); // ✅ 控制 Toast 状态
  const [toastMessage, setToastMessage] = useState(""); // ✅ 动态设置 Toast 消息
  const [toastType, setToastType] = useState("success"); // ✅ 记录 Toast 类型

  const [passwordStrength, setPasswordStrength] = useState(0); // ✅ 密码强度状态
  const [showPassword, setShowPassword] = useState(false); // ✅ 控制密码可见性

  // ✅ Yup 验证规则
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(3, "Password must be at least 3 characters")
      .required("Password is required"),
  });

  // 📌 处理注册逻辑
  const register = (values, { setSubmitting, setErrors }) => {
    axios
      .post("http://localhost:3001/users/register", values)
      .then((response) => {
        if (response.data.success) {
          // alert("✅ Registration successful! Please login.");
          // navigate("/login"); // ✅ 使用 Toast 显示成功信息
          setToastMessage("✅ Registration successful! Please login.");
          setToastType("success");
          setShowToast(true);

          setTimeout(() => {
            setShowToast(false);
            navigate("/login"); // ✅ 3 秒后跳转到 Login
          }, 2000);
        }
      })
      .catch((error) => {
        console.error("Registration Error:", error.response); // ✅ 调试日志

        // 🔹 处理后端返回的错误
        if (error.response) {
          const errorMsg = error.response.data?.error || "Unknown error";
          if (error.response.status === 400) {
            setErrors({ email: errorMsg }); // 显示在 Email 下方
          } else {
            // ✅ 显示错误 Toast
            setToastMessage(`❌ ${errorMsg}`);
            setToastType("error");
            setShowToast(true);

            setTimeout(() => setShowToast(false), 3000);
          }
        } else {
          alert("Server error, please try again later.");
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
    <div className="registerContainer">
      {/* ✅ Toast Notification */}
      {showToast && <div className={`toast ${toastType}`}>{toastMessage}</div>}

      <h2>Register</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={register}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form>
            <label>Email:</label>
            <Field type="email" name="email" placeholder="Enter your email" />
            <ErrorMessage name="email" component="div" className="error" />

            <label>Password:</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"} // ✅ 控制密码显示/隐藏
                name="password"
                placeholder="Enter your password"
                value={values.password}
                onChange={(e) => {
                  const newPassword = e.target.value;
                  setFieldValue("password", newPassword);
                  setPasswordStrength(zxcvbn(newPassword).score);
                }}
              />
              {/* ✅ 眼睛按钮 */}
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <ErrorMessage name="password" component="div" className="error" />

            {/* ✅ 显示密码强度 */}
            <div className={`password-strength strength-${passwordStrength}`}>
              Password Strength:{" "}
              {
                ["Very Weak", "Weak", "Medium", "Strong", "Very Strong"][
                  passwordStrength
                ]
              }
            </div>

            <button
              className="register-btn"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default Register;
