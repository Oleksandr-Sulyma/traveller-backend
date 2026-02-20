import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      maxlength: 80,
      required: true,
    },
    article: {
      type: String,
      maxlength: 2500,
      required: true,
    },
    img: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    favoriteCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

storySchema.index({ category: 1 });
storySchema.index({ ownerId: 1 });
storySchema.index({ favoriteCount: -1, createdAt: -1 });

export const Story = mongoose.model("Story", storySchema);
