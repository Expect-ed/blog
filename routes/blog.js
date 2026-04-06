const express = require('express');
const router = express.Router();
const db = require('../db');
const { marked } = require('marked');
const config = require('../config');

router.get('/', (req, res) => {
  const posts = db.prepare(
    'SELECT id, title, slug, created_at FROM posts WHERE published = 1 ORDER BY created_at DESC'
  ).all();
  res.render('index', { posts, config });
});

router.get('/:slug', (req, res) => {
  const post = db.prepare(
    'SELECT * FROM posts WHERE slug = ? AND published = 1'
  ).get(req.params.slug);
  if (!post) return res.status(404).send('文章不存在');
  post.html = marked.parse(post.content);
  res.render('post', { post, config });
});

module.exports = router;