import React, { useState } from "react";
import axios from "axios";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/ResetPassword.css"; // 你也可以自己写样式

function ResetPassword() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Required"),
    otp: Yup.string()
      .length(6, "Must be 6 digits")
      .matches(/^\d+$/, "Digits only"),
    newPassword: Yup.string()
      .min(6, "At least 6 characters")
      .required("Required"),
  });

  // 发送 OTP 请求
  const sendOtp = async (values) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/send-reset-otp`,
        { email: values.email }
      );

      setToastMessage(res.data.message);
      setToastType("success");
      setOtpSent(true);
    } catch (err) {
      setToastMessage(err.response?.data?.error || "Failed to send OTP");
      setToastType("error");
    } finally {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // 重置密码请求
  const resetPassword = async (values, { setSubmitting }) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/reset-password`,
        values
      );

      setToastMessage(res.data.message);
      setToastType("success");

      setTimeout(() => {
        setShowToast(false);
        window.location.href = "/login"; // 成功重置跳转到登录
      }, 3000);
    } catch (err) {
      setToastMessage(err.response?.data?.error || "Reset failed");
      setToastType("error");
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setSubmitting(false);
      setShowToast(true);
    }
  };

  return (
    <div className="resetPasswordContainer">
      {showToast && <div className={`toast ${toastType}`}>{toastMessage}</div>}

      <h2>Reset Password</h2>

      <Formik
        initialValues={{ email: "", otp: "", newPassword: "" }}
        validationSchema={validationSchema}
        onSubmit={resetPassword}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={values.email}
              onChange={(e) => setFieldValue("email", e.target.value)}
              disabled={otpSent}
            />
            <ErrorMessage name="email" component="div" className="error" />

            <button
              type="button"
              onClick={() => sendOtp(values)}
              disabled={otpSent}
              className="otp-btn"
            >
              {otpSent ? "OTP Sent" : "Send OTP"}
            </button>

            {otpSent && (
              <>
                <label>OTP:</label>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  maxLength="6"
                  onChange={(e) => setFieldValue("otp", e.target.value)}
                />
                <ErrorMessage name="otp" component="div" className="error" />

                <label>New Password:</label>
                <div className="password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="Enter new password"
                    onChange={(e) =>
                      setFieldValue("newPassword", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <ErrorMessage
                  name="newPassword"
                  component="div"
                  className="error"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="reset-btn"
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </button>
              </>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default ResetPassword;
