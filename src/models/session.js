// import mongoose from 'mongoose';

// const sessionSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//       index: true,
//     },
//     accessToken: {
//       type: String,
//       required: true,
//     },
//     refreshToken: {
//       type: String,
//       required: true,
//     },
//     accessTokenValidUntil: {
//       type: Date,
//       required: true,
//     },
//     refreshTokenValidUntil: {
//       type: Date,
//       required: true,
//       index: { expires: 0 },
//     },
//   },
//   {
//     timestamps: true,
//     versionKey: false,
//   },
// );

// export const Session = mongoose.model('Session', sessionSchema);


import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    accessTokenValidUntil: { type: Date, required: true },
    refreshTokenValidUntil: { type: Date, required: true, index: { expires: 0 } },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

sessionSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const Session = mongoose.model("Session", sessionSchema);
