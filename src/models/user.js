import { Schema, model, Types } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: "https://ac.goit.global/fullstack/react/default-avatar.jpg",
    },
    password: {
      type: String,
      required: true,
    },
    articlesAmount: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
// favorites: [
    //   {
    //     type: Types.ObjectId,
    //     ref: "Story",
    //   },
    // ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = model("User", userSchema);

