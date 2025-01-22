import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "../styles/Register.css";

function Register() {
  const initialValues = {
    email: "",
    password: "",
  };

  const navigate = useNavigate();

  // ✅ Yup 验证规则
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(3, "Password must be at least 3 characters")
      .required("Password is required"),
  });

  const register = (values, { setSubmitting, setErrors }) => {
    axios
      .post("http://localhost:3001/users/register", values)
      .then((response) => {
        if (response.data.success) {
          alert("✅ Registration successful! Please login.");
          navigate("/login");
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
            alert(errorMsg);
          }
        } else {
          alert("Server error, please try again later.");
        }
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div className="registerContainer">
      <h2>Register</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={register}
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
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default Register;
