// import mongoose from "mongoose";

// const categorySchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
// });

// categorySchema.methods.toJSON = function () {
//   const obj = this.toObject();
//   obj.id = obj._id;

//   delete obj._id;
//   delete obj.__v;
//   return obj;
// };

// export const Category = mongoose.model("Category", categorySchema);


import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
});


categorySchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Category = mongoose.model("Category", categorySchema);
