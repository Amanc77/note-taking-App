import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import sendOTP from "../utils/sendOTP.js";
import { parseDateInput } from "../utils/parseDate.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post("/send-otp", async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    if (!email || !name)
      return res.status(400).json({ message: "Name and email required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpToken = jwt.sign({ email, otp }, JWT_SECRET, { expiresIn: "5m" });

    try {
      await sendOTP(name, email, otp);
    } catch (err) {
      console.error("sendOTP error:", (err as any)?.message || err);
    }

    return res.json({ message: "OTP sent (stateless)", otpToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/verify-otp", async (req: Request, res: Response) => {
  try {
    const { otpToken, otp, password, name, dob } = req.body;
    if (!otpToken || !otp || !password)
      return res
        .status(400)
        .json({ message: "otpToken, otp and password required" });

    let payload: any;
    try {
      payload = jwt.verify(otpToken, JWT_SECRET);
    } catch {
      return res.status(400).json({ message: "Invalid or expired otpToken" });
    }

    if (payload.otp !== otp || !payload.email) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = new User({
        name: name || "User",
        email: payload.email,
        dob: parseDateInput(dob) ?? null,
        authProvider: "local",
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();

    const authToken = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token: authToken,
      user: { id: user._id, name: user.name, email: user.email, dob: user.dob },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const authToken = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token: authToken,
      user: { id: user._id, name: user.name, email: user.email, dob: user.dob },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/google", async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "idToken required" });

    const ticket = await oauthClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email)
      return res.status(400).json({ message: "Invalid Google token" });

    const email = payload.email;
    const name = payload.name || "Google User";

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, authProvider: "google" });
      await user.save();
    } else {
      user.authProvider = "google";
      if (!user.name) user.name = name;
      await user.save();
    }

    const authToken = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token: authToken,
      user: { id: user._id, name: user.name, email: user.email, dob: user.dob },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Google sign-in failed" });
  }
});

export default router;
