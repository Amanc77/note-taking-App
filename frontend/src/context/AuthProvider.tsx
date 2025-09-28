import React, { createContext, useEffect, useState, ReactNode } from "react";
import { toast } from "react-toastify";

interface AuthContextType {
  user: boolean;
  setUser: React.Dispatch<React.SetStateAction<boolean>>;
  signUpInitiator: (formData: any) => Promise<any>;
  signUpVerification: (data: any) => Promise<any>;
  signInInitiator: (formData: any) => Promise<any>;
  signInVerification: (data: any) => Promise<any>;
  profileName: string;
  profileEmail: string;
}

const serverAPI = "http://localhost:5000";

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  // ================== SIGN UP ==================
  const signUpInitiator = async (formData: any) => {
    try {
      const res = await fetch(`${serverAPI}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "OTP sent to your email");
        localStorage.setItem("signUpVerificationToken", data.token);
      } else {
        toast.error(data.message || "Signup failed");
      }

      return data;
    } catch (e: any) {
      toast.error("Sign Up failed");
      console.error(e);
      return { success: false, message: e.message };
    }
  };

  const signUpVerification = async (dataObj: any) => {
    try {
      const res = await fetch(`${serverAPI}/auth/signup/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataObj),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Signup verified successfully");
        setProfileName(data.user?.name || "");
        setProfileEmail(data.user?.email || "");
        localStorage.removeItem("signUpVerificationToken");
        localStorage.setItem("token", data.token);
        setUser(true);
      } else {
        toast.error(data.message || "Verification failed");
      }

      return data;
    } catch (e: any) {
      toast.error("Verification failed");
      console.error(e);
      return { success: false, message: e.message };
    }
  };

  // ================== SIGN IN ==================
  const signInInitiator = async (formData: any) => {
    try {
      const res = await fetch(`${serverAPI}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "OTP sent to your email");
        localStorage.setItem("signInVerificationToken", data.token);
      } else {
        toast.error(data.message || "Signin failed");
      }

      return data;
    } catch (e: any) {
      toast.error("Sign In failed");
      console.error(e);
      return { success: false, message: e.message };
    }
  };

  const signInVerification = async (dataObj: any) => {
    try {
      const res = await fetch(`${serverAPI}/auth/signin/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataObj),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Login successful");
        setProfileName(data.user?.name || "");
        setProfileEmail(data.user?.email || "");
        localStorage.removeItem("signInVerificationToken");
        localStorage.setItem("token", data.token);
        setUser(true);
      } else {
        toast.error(data.message || "Verification failed");
      }

      return data;
    } catch (e: any) {
      toast.error("Verification failed");
      console.error(e);
      return { success: false, message: e.message };
    }
  };

  // ================== AUTO LOGIN ==================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setUser(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        signUpInitiator,
        signUpVerification,
        signInInitiator,
        signInVerification,
        profileName,
        profileEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
