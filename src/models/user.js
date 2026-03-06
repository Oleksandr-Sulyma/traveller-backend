// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, trim: true, required: true },
//     email: { type: String, required: true, unique: true, trim: true },
//     avatarUrl: {
//       type: String,
//       default: "https://ac.goit.global/fullstack/react/default-avatar.jpg",
//     },
//     password: { type: String, required: true },
//     articlesAmount: { type: Number, default: 0 },
//     description: { type: String, default: "" },
//     savedStories: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Story",
//       },
//     ],
//   },
//   {
//     timestamps: true,
//     versionKey: false,
//   }
// );

// userSchema.methods.toJSON = function () {
//   const obj = this.toObject();

//   obj.id = obj._id;

//   delete obj._id;
//   delete obj.__v;
//   delete obj.password;

//   return obj;
// };

// export const User = mongoose.model("User", userSchema);

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, required: true, unique: true, trim: true },
    avatarUrl: {
      type: String,
      default: "https://ac.goit.global/fullstack/react/default-avatar.jpg",
    },
    password: { type: String, required: true },
    articlesAmount: { type: Number, default: 0 },
    description: { type: String, default: "" },
    savedStories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Story",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.password;
    return ret;
  },
});

export const User = mongoose.model("User", userSchema);
