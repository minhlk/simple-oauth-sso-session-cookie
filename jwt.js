import express, { json, urlencoded } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // For password hashing
import 'dotenv/config';
const app = express();
const port = 3030;

// Dummy user data (replace with database integration in real scenarios)
const users = [
  {
    id: 1,
    username: "admin",
    password: "$2a$10$mHmYSIdzhEBw8BDiIlkZMuTq/MlPZ/eOQndzq.0YL/7gmlp8xOrRe",
  }, // hashed password for '123'
];

// Middleware setup
app.use(json());
app.use(urlencoded({ extended: true }));

app.get('/', (req, res) => {
  let response = '';
  response += `
    <h1>Generate JWT Token</h1>
    <form method="post" action="/generate">
      <input type="text" name="username" placeholder="Username" required><br>
      <input type="password" name="password" placeholder="Password" required><br>
      <button type="submit">Generate</button>
    </form>
    
    <h1>Login By JWT</h1>
    <form method="post" action="/login">
      <input type="text" name="token" placeholder="token" required><br>
      <button type="submit">Login By JWT token</button>
    </form>
    
  `;
  res.send(response);
});

// Login route to generate JWT
app.post("/generate", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate JWT token
  const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
  );
  let [header, payload, signature] = token.split('.');
  res.json({ 
    header,
    payload,
    signature,
    token
  });
});

// Protected route example
app.post("/login", verifyToken, (req, res) => {
  // If token is valid, you can access the decoded user information
  res.json({ message: "Profile accessed successfully", user: req.user });
});

// Middleware function to verify JWT
function verifyToken(req, res, next) {
  let token = ''
  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.body.token) {
    token = req.body.token;
  }

  if (!token) {
      return res.status(403).json({ message: "Token not provided" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Failed to authenticate token" });
    }

    req.user = decoded;
    next();
  });
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
