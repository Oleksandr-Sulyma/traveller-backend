// import mongoose from "mongoose";

// const storySchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       maxlength: 80,
//       required: true,
//     },
//     article: {
//       type: String,
//       maxlength: 2500,
//       required: true,
//     },
//     img: {
//       type: String,
//       required: true,
//     },
//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Category",
//       required: true,
//     },
//     ownerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     favoriteCount: {
//       type: Number,
//       default: 0,
//     },
//   },
//   {
//     timestamps: true,
//     versionKey: false
//   },
// );

// storySchema.methods.toJSON = function () {
//   const obj = this.toObject();
//   obj.id = obj._id;

//   if (obj.createdAt) {
//     const dateObj = new Date(obj.createdAt);
//     obj.formattedDate = dateObj.toLocaleDateString('uk-UA', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//     });
//   }

//   delete obj._id;
//   delete obj.__v;
//   return obj;
// };


// storySchema.index({ category: 1 });
// storySchema.index({ ownerId: 1 });
// storySchema.index({ favoriteCount: -1, createdAt: -1 });

// export const Story = mongoose.model("Story", storySchema);

import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    title: { type: String, maxlength: 80, required: true },
    article: { type: String, maxlength: 2500, required: true },
    img: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    favoriteCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

storySchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();

    if (ret.createdAt) {
      const dateObj = new Date(ret.createdAt);
      ret.formattedDate = dateObj.toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }

    delete ret._id;
    return ret;
  },
});

storySchema.index({ category: 1 });
storySchema.index({ ownerId: 1 });
storySchema.index({ favoriteCount: -1, createdAt: -1 });

export const Story = mongoose.model("Story", storySchema);
