const express = require('express');
const router = express.Router();
const db = require('../db');
const config = require('../config');

function auth(req, res, next) {
  if (req.session.loggedIn) return next();
  res.redirect('/admin/login');
}

function slugify(text) {
  return encodeURIComponent(
    text.trim().toLowerCase().replace(/\s+/g, '-').substring(0, 60)
  ) + '-' + Date.now();
}

router.get('/', (req, res) => res.redirect('/admin/dashboard'));

router.get('/login', (req, res) => {
  if (req.session.loggedIn) return res.redirect('/admin/dashboard');
  res.render('admin/login', { error: null });
});

router.post('/login', (req, res) => {
  if (req.body.password === config.adminPassword) {
    req.session.loggedIn = true;
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { error: '密码错误' });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

router.get('/dashboard', auth, (req, res) => {
  const posts = db.prepare(
    'SELECT id, title, slug, published, created_at FROM posts ORDER BY created_at DESC'
  ).all();
  res.render('admin/dashboard', { posts, config });
});

router.post('/posts/:id/toggle', auth, (req, res) => {
  const post = db.prepare('SELECT published FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.redirect('/admin/dashboard');
  db.prepare(
    `UPDATE posts SET published = ?, updated_at = datetime('now','localtime') WHERE id = ?`
  ).run(post.published ? 0 : 1, req.params.id);
  res.redirect('/admin/dashboard');
});

router.get('/posts/new', auth, (req, res) => {
  res.render('admin/editor', { post: null, config });
});

router.post('/posts/new', auth, (req, res) => {
  const { title, content } = req.body;
  const slug = slugify(title);
  db.prepare('INSERT INTO posts (title, slug, content) VALUES (?, ?, ?)').run(title, slug, content);
  res.redirect('/admin/dashboard');
});

router.get('/posts/:id/edit', auth, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.redirect('/admin/dashboard');
  res.render('admin/editor', { post, config });
});

router.post('/posts/:id/edit', auth, (req, res) => {
  const { title, content } = req.body;
  db.prepare(
    `UPDATE posts SET title = ?, content = ?, updated_at = datetime('now','localtime') WHERE id = ?`
  ).run(title, content, req.params.id);
  res.redirect('/admin/dashboard');
});

router.post('/posts/:id/delete', auth, (req, res) => {
  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  res.redirect('/admin/dashboard');
});

module.exports = router;