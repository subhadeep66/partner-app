const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let currentUser = null;

// LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const users = JSON.parse(fs.readFileSync("users.json"));

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (user) {
    currentUser = user;
    res.json({ success: true, role: user.role });
  } else {
    res.json({ success: false });
  }
});

// CHECK AUTH
app.get("/me", (req, res) => {
  if (currentUser) {
    res.json(currentUser);
  } else {
    res.status(401).send("Not logged in");
  }
});

// ADD PARTNER (only admin)
app.post("/add-partner", (req, res) => {
  if (!currentUser || currentUser.role !== "admin") {
    return res.status(403).send("Unauthorized");
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