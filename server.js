const express = require("express");
const fs = require("fs");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET = "mysecretkey"; // later move to env

app.use(express.json());
app.use(express.static("public"));

let currentUser = null;

// LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const users = JSON.parse(fs.readFileSync("users.json"));

  const user = users.find(u => u.username === username);

  if (!user) return res.json({ success: false });

  const isMatch = password === user.password; // simple for now

  if (!isMatch) return res.json({ success: false });

  // create token
  const token = jwt.sign(
    { username: user.username, role: user.role },
    SECRET,
    { expiresIn: "1h" }
  );

  res.json({ success: true, token });
});

function auth(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) return res.status(401).json({ success: false, message: "No token" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
}

// CHECK AUTH
app.get("/me", (req, res) => {
  if (currentUser) {
    res.json(currentUser);
  } else {
    return res.status(401).json({
  success: false,
  message: "Not logged in"
  });
  }
});

// ADD PARTNER (only admin)
app.post("/add-partner", auth, (req, res) => {
  if (req.user.role !== "admin") {
   return res.status(403).json({ success: false, message: "Only admin allowed" });
  }
  if (!currentUser || currentUser.role !== "admin") {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  const { username, password } = req.body;

  const users = JSON.parse(fs.readFileSync("users.json"));

  users.push({
    username,
    password,
    role: "partner"
  });

  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

  res.json({ success: true });
});

// GET USERS (for list)
app.get("/users", (req, res) => {
  const users = JSON.parse(fs.readFileSync("users.json"));
  res.json(users);
});

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.listen(PORT, () => console.log("Server running on port " + PORT));