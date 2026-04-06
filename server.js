const express = require("express");
const fs = require("fs");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET = "mysecretkey"; // later move to env

app.use(express.json());
app.use(express.static("public"));


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
  const authHeader = req.headers.authorization;

  if (!authHeader) {
  return res.status(401).json({ success: false, message: "No token" });
  }

  const token = authHeader.split(" ")[1]; // extract Bearer token
  console.log("TOKEN RECEIVED:", token);

  if (!token) {
    return res.status(401).json({ success: false, message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
  console.log("JWT ERROR:", err.message); // 👈 add this
  return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

// CHECK AUTH
app.get("/me", auth, (req, res) => {
  res.json(req.user);
});

// ADD PARTNER (only admin)
app.post("/add-partner", auth, (req, res) => {
  if (req.user.role !== "admin") {
  return res.status(403).json({ success: false, message: "Only admin allowed" });
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


//add-app
app.post("/add-app", auth, (req, res) => {
  console.log("REQ.USER:", req.user);
  console.log("BODY:", req.body);

  const { name, status, platform, revenue } = req.body;

  const users = JSON.parse(fs.readFileSync("users.json"));

  const user = users.find(u => u.username === req.user.username);

  // 🔥 IMPORTANT CHECK
  if (!user) {
    return res.json({ success: false, message: "User not found" });
  }

  if (!user.apps) user.apps = [];

  // 🔥 DUPLICATE CHECK
  const exists = user.apps.find(
    a => a.name === name && a.platform === platform
  );

  if (exists) {
    return res.json({
      success: false,
      message: "Campaign already exists for this platform"
    });
  }

  user.apps.push({
    name,
    status,
    platform,
    revenue
  });

  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

  res.json({ success: true });
});

//update campaigns status

app.post("/update-status", auth, (req, res) => {
  const { name, platform, status } = req.body;

  const users = JSON.parse(fs.readFileSync("users.json"));

  users.forEach(user => {
    if (user.apps) {
      user.apps.forEach(app => {
        if (app.name === name && app.platform === platform) {
          app.status = status;
        }
      });
    }
  });

  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

  res.json({ success: true });
});

//campaign
app.get("/campaigns", (req, res) => {
  const users = JSON.parse(fs.readFileSync("users.json"));

  let campaigns = [];

  users.forEach(user => {
    if (user.apps) {
      user.apps.forEach(app => {
        campaigns.push({
          appName: app.name,
          status: app.status,
          platform: app.platform,
          revenue: app.revenue,
          owner: user.username
        });
      });
    }
  });

  res.json(campaigns);
});

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.listen(PORT, () => console.log("Server running on port " + PORT));