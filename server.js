const express = require('express');
const session = require('express-session');
const path = require('path');
const config = require('./config');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'blog-secret-2024-xjtu',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

app.use('/admin', require('./routes/admin'));
app.use('/', require('./routes/blog'));

app.listen(config.port, () => {
  console.log(`running on http://localhost:${config.port}`);
});