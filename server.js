const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const Post = require('./models/Post');

const app = express();

// ✅ Correct CORS: enable it before routes
app.use(cors({
  origin: 'https://akloorrevanth.github.io', // GitHub Pages frontend
  methods: ['GET', 'POST', 'DELETE'],
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'public')));

// 🔗 MongoDB connection
mongoose.connect('mongodb+srv://bloguser:blogpass123@cluster0.i4cpii9.mongodb.net/daily-blog?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

// 📷 Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 🔐 Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// ✅ API Routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.status(200).json({ message: 'Login success' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/api/posts', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

app.post('/api/posts', upload.single('image'), async (req, res) => {
  const { title, description } = req.body;
  const image = req.file ? req.file.path : null;
  const post = new Post({ title, description, image, likes: 0 });
  await post.save();
  res.status(201).json(post);
});

app.delete('/api/posts/:id', async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

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

// 🌐 Health check or root route
app.get("/", (req, res) => {
  res.send("🚀 Welcome to My Blog API! Server is live.");
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
