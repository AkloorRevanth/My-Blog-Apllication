const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Post = require('./models/Post');

dotenv.config();

const app = express();

// ✅ CORS (allow GitHub Pages frontend)
app.use(cors({
  origin: 'https://akloorrevanth.github.io', // Replace with your GitHub Pages domain
  methods: ['GET', 'POST', 'DELETE'],
}));

// ✅ Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ MongoDB connection
mongoose.connect('mongodb+srv://bloguser:blogpass123@cluster0.i4cpii9.mongodb.net/daily-blog?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer config for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'blogImages',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});
const upload = multer({ storage });

// ✅ Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// 🔐 Admin login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.status(200).json({ message: "Login successful" });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// ✅ Create new post
app.post('/api/posts', upload.single('image'), async (req, res) => {
  const { title, description } = req.body;
  const image = req.file ? req.file.path : null;

  const post = new Post({ title, description, image, likes: 0 });
  await post.save();
  res.status(201).json(post);
});

// ✅ Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('❌ Error fetching posts:', err);
    res.status(500).json({ message: 'Internal server error while fetching posts' });
  }
});


// ✅ Delete a post
app.delete('/api/posts/:id', async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// ✅ Like a post
app.post('/api/posts/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.likes += 1;
    await post.save();
    res.status(200).json({ likes: post.likes });
  } catch (err) {
    res.status(500).json({ error: "Failed to like post" });
  }
});

// 🌐 Root route for server check
app.get("/", (req, res) => {
  res.send("🚀 Welcome to My Blog API! Server is live.");
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
