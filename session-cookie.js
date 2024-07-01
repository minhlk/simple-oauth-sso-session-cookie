import express, { urlencoded } from 'express';
import session from 'express-session';
import 'dotenv/config';
const app = express();
const port = 3030;

// Middleware setup
app.use(urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));

// Dummy user data (replace with a database in real scenarios)
const users = [
  { id: 1, username: 'admin', password: '123', name: 'Admin User' },
];

app.get('/', (req, res) => {
  const user = req.session.user;
  let response = '';
  if (user) {
    response += `
      <h1>Welcome ${user.name}</h1>
      <a href="/logout">Logout</a>
    `
  }
  response += `
    <h1>Login</h1>
    <form method="post" action="/">
      <input type="text" name="username" placeholder="Username" required><br>
      <input type="password" name="password" placeholder="Password" required><br>
      <button type="submit">Login</button>
    </form>
  `;
  res.send(response);
});

app.post('/', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    req.session.user = user;
    res.redirect('/');
  } else {
    res.send('Invalid username or password');
  }
});


app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

