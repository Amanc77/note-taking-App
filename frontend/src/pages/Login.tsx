import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signInInitiator, signInVerification } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: "" });
  const [inputOtp, setInputOtp] = useState({ otp: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [otpField, setOtpField] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setInputOtp((prev) => ({ ...prev, [id]: value }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Form Validation Error");
      return;
    }

    const res = await signInInitiator(formData);
    if (res?.success) setOtpField(true);
  };

  const handleSignInVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(inputOtp.otp)) {
      setErrors({ otp: "OTP must be 6 digits" });
      return;
    }

    const res = await signInVerification({
      otp: inputOtp.otp,
      tokenForVerification: localStorage.getItem("signInVerificationToken"),
    });

    if (res?.success) {
      setFormData({ email: "" });
      setOtpField(false);
      navigate("/dashboard");
    }
  };

  return (
    <div className="w-full min-h-screen mx-auto flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4">
      {/* Left Column */}
      <div className="w-full sm:w-1/2 max-w-[600px] flex flex-col items-center justify-center gap-1 px-4">
        <div className="flex items-center justify-center gap-2 mt-4">
          <img src="/top.png" alt="logo" className="h-8 w-8 object-cover" />
          <span className="font-medium text-lg">HD</span>
        </div>

        <h3 className="font-bold text-2xl mt-3">Sign In</h3>
        <p className="text-gray-400 text-sm">Login to your account</p>

        <form
          onSubmit={otpField ? handleSignInVerify : handleSignIn}
          className="w-full space-y-4 mt-3"
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="your.email@example.com"
              className={`w-full px-4 py-2 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* OTP */}
          {otpField && (
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                OTP
              </label>
              <input
                type="text"
                id="otp"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                className={`w-full px-4 py-2 border ${
                  errors.otp ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                value={inputOtp.otp}
                onChange={handleOtpChange}
              />
              {errors.otp && (
                <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
              )}
              <a
                href="#"
                className="block text-sm text-blue-600 hover:text-blue-700 mt-2"
              >
                Resend OTP
              </a>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150"
          >
            {otpField ? "Verify OTP & Sign In" : "Get OTP"}
          </button>
        </form>

        <p className="text-xs text-center mt-3 text-gray-500">
          Don't have an account?{" "}
          <span
            className="text-blue-400 underline cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </div>

      {/* Right Column */}
      <div className="hidden sm:flex sm:w-1/2 h-[100vh] overflow-hidden rounded-l-sm shadow-lg">
        <img
          src="/right-column.png"
          alt="Right illustration"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Login;
