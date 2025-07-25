const API = 'https://my-blog-apllication.onrender.com/api';

document.getElementById('postForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const formData = new FormData();
  formData.append('title', document.getElementById('title').value);
  formData.append('description', document.getElementById('description').value);
  const image = document.getElementById('image').files[0];
  if (image) formData.append('image', image);

  const res = await fetch(`${API}/posts`, {
    method: 'POST',
    body: formData
  });

  if (res.ok) {
    this.reset();
    loadPosts();
  }
});

document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('adminUsername').value;
  const password = document.getElementById('adminPassword').value;

  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (data.message === 'Login successful') {
    localStorage.setItem('isAdmin', 'true');
    document.getElementById('loginStatus').textContent = '✅ Logged in as Admin';
    document.getElementById('logoutBtn').style.display = 'inline';
    loadPosts();
  } else {
    document.getElementById('loginStatus').textContent = '❌ Invalid credentials';
  }
});


document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('isAdmin');  // Clear admin flag on logout
  document.getElementById('loginStatus').textContent = 'Logged out';
  document.getElementById('logoutBtn').style.display = 'none';
  loadPosts();
});

async function loadPosts() {
  try {
    const res = await fetch(`${API}/posts`);
    if (!res.ok) throw new Error("Failed to fetch posts");
    const posts = await res.json();
    const postContainer = document.getElementById('posts');
    const isAdminRaw = localStorage.getItem('isAdmin');
    const isAdmin = (typeof isAdminRaw === 'string' && isAdminRaw.toLowerCase() === 'true');

    console.log('Is admin?', isAdmin);

    postContainer.innerHTML = '';
    posts.forEach(post => {
      const div = document.createElement('div');
      div.className = 'post';
      div.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.description}</p>
        ${post.image && post.image.startsWith("http") ? `<img src="${post.image}" width="200">` : ''}
        <p>👍 Likes: ${post.likes} <button onclick="likePost('${post._id}')">Like</button></p>
        <small>${post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Date not available'}</small>
        ${isAdmin ? `<button onclick="deletePost('${post._id}')">🗑 Delete</button>` : ''}
      `;
      postContainer.appendChild(div);
    });
  } catch (err) {
    console.error("❌ loadPosts failed:", err);
    document.getElementById('posts').innerHTML = "<p style='color:red;'>Failed to load posts</p>";
  }
}


async function deletePost(id) {
  if (!confirm("Are you sure you want to delete this post?")) return;
  await fetch(`${API}/posts/${id}`, { method: 'DELETE' });
  loadPosts();
}

function hasLiked(id) {
  const liked = JSON.parse(localStorage.getItem('likedPosts') || '[]');
  return liked.includes(id);
}

function markLiked(id) {
  const liked = JSON.parse(localStorage.getItem('likedPosts') || '[]');
  liked.push(id);
  localStorage.setItem('likedPosts', JSON.stringify(liked));
}

async function likePost(id) {
  if (hasLiked(id)) return alert("You've already liked this post!");
  const res = await fetch(`${API}/posts/${id}/like`, { method: 'POST' });
  if (res.ok) {
    markLiked(id);
    loadPosts();
  } else {
    alert("❌ Failed to like post");
  }
}

loadPosts();
