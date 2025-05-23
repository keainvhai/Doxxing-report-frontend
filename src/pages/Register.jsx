import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import zxcvbn from "zxcvbn";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]); // ✅ 存储 OTP 6 位

  // ✅ Yup 验证规则
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    otp: Yup.string()
      .length(6, "OTP must be 6 digits")
      .matches(/^\d+$/, "OTP must be numbers")
      .required("OTP is required"),
    password: Yup.string()
      .min(3, "Password must be at least 3 characters")
      .required("Password is required"),
  });

  // 📌 发送 OTP
  const sendOTP = async (values) => {
    setIsSendingOtp(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/send-otp`,
        { email: values.email }
      );
      setToastMessage(response.data.message);
      setToastType("success");
      setOtpSent(true);
    } catch (error) {
      if (error.response?.status === 429) {
        setToastMessage(
          error.response.data ||
            "🚫 You're sending OTP too frequently. Please wait a moment."
        );
        setToastType("error");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setIsSendingOtp(false);
        return;
      }
      // ✅ 详细处理 error.response 的错误信息
      let errorMsg = " Failed to send OTP. Please try again.";
      if (error.response && error.response.data && error.response.data.error) {
        errorMsg = ` ${error.response.data.error}`;
      }

      setToastMessage(errorMsg);
      setToastType("error");
    } finally {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setIsSendingOtp(false);
    }
  };

  // 📌 处理注册逻辑
  const register = (values, { setSubmitting, setErrors }) => {
    const otpString = otpValues.join(""); // ✅ 解决 OTP 变数组的问题

    axios
      .post(
        `${import.meta.env.VITE_API_URL}/users/register`, // ✅ 动态 URL
        { ...values, otp: otpString },
        {
          withCredentials: true, // ✅ 只有你后端用 Cookie 就加
        }
      )
      .then((response) => {
        if (response.data.success) {
          setToastMessage("✅ Registration successful! Please login.");
          setToastType("success");
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
            navigate("/login");
          }, 2000);
        }
      })
      .catch((error) => {
        if (error.response) {
          const errorMsg = error.response.data?.error || "Unknown error";
          if (error.response.status === 429) {
            setToastMessage(
              errorMsg ||
                "🚫 You're registering too frequently. Please wait a moment."
            );
            setToastType("error");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
          }
          if (error.response.status === 400) {
            setErrors({ email: errorMsg });
          } else {
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
    <div className="registerContainer">
      {showToast && <div className={`toast ${toastType}`}>{toastMessage}</div>}
      <h2>Register</h2>
      <Formik
        initialValues={{ email: "", otp: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={register}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              onChange={(e) => setFieldValue("email", e.target.value)}
            />
            <ErrorMessage name="email" component="div" className="error" />

            {/* ✅ 发送 OTP 按钮 */}
            <button
              type="button"
              className="otp-btn"
              disabled={isSendingOtp || otpSent}
              onClick={() => sendOTP(values)}
            >
              {isSendingOtp
                ? "Sending OTP..."
                : otpSent
                ? "OTP Sent"
                : "Send OTP"}
            </button>

            {/* ✅ 只有在 OTP 发送后才显示 OTP 输入框 */}
            {otpSent && (
              <>
                <label>OTP:</label>
                <div className="otp-container">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      className="otp-input"
                      value={otpValues[index]} // ✅ 绑定状态
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ""); // ✅ 只允许输入数字
                        if (value.length === 1) {
                          const newOtpValues = [...otpValues];
                          newOtpValues[index] = value;
                          setOtpValues(newOtpValues);
                          setFieldValue("otp", newOtpValues.join("")); // ✅ 让 Formik 知道 OTP 的值
                          if (index < 5) {
                            document.getElementById(`otp-${index + 1}`).focus(); // ✅ 自动跳到下一个输入框
                          }
                        }
                      }}
                      id={`otp-${index}`}
                    />
                  ))}
                </div>
                <ErrorMessage name="otp" component="div" className="error" />
              </>
            )}

            <label>Password:</label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                onChange={(e) => {
                  setFieldValue("password", e.target.value);
                  setPasswordStrength(zxcvbn(e.target.value).score);
                }}
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* ✅ 密码强度进度条 */}
            {values.password && (
              <>
                <div className="password-strength-bar">
                  <div
                    className={`strength-level strength-${passwordStrength}`}
                    style={{ width: `${(passwordStrength + 1) * 20}%` }}
                  ></div>
                </div>
                <div className="password-strength-text">
                  {
                    ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"][
                      passwordStrength
                    ]
                  }
                </div>
              </>
            )}

            <ErrorMessage name="password" component="div" className="error" />

            {/* ✅ 只有在 OTP 发送后才允许提交注册 */}
            {otpSent && (
              <button
                className="register-btn"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register"}
              </button>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default Register;
