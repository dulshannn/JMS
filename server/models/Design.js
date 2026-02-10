import mongoose from "mongoose";

const designSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Set to true if you want to force login
  },
  title: {
    type: String,
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["ring", "necklace", "earring", "bracelet", "tiara"],
    default: "ring",
  },
  imageUrl: {
    type: String, // Stores the Base64 string or a URL
    required: true,
  },
  materials: [
    {
      id: String,
      name: String,
    },
  ],
  gemstones: [
    {
      id: String,
      name: String,
    },
  ],
  customizations: {
    style: String,
    complexity: String,
    estimatedCost: Number,
  },
  isAIGenerated: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Design = mongoose.model("Design", designSchema);
export default Design;