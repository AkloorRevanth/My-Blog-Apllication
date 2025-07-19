const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  likes: { type: Number, default: 0 },
}, { timestamps: true });  // 🔥 important for sorting by createdAt

module.exports = mongoose.model('Post', postSchema);
