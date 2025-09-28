import mongoose, { Document, Schema, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  dob?: Date | null;
  authProvider: "local" | "google";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    dob: { type: Date, default: null },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
