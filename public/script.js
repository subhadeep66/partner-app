// LOGIN
function login() {
  fetch("/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      username: document.getElementById("username").value,
      password: document.getElementById("password").value
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      window.location.href = "/dashboard.html";
    } else {
      alert("Invalid login");
    }
  });
}

// ADD PARTNER
function addPartner() {
  fetch("/add-partner", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      username: document.getElementById("newUser").value,
      password: document.getElementById("newPass").value
    })
  })
  .then(res => res.json())
  .then(() => loadUsers());
}

// LOAD USERS
function loadUsers() {
  fetch("/users")
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("userList");
      list.innerHTML = "";

      data.forEach(u => {
        const li = document.createElement("li");
        li.innerText = `${u.username} (${u.role})`;
        list.appendChild(li);
      });
    });
}

if (window.location.pathname.includes("dashboard")) {
  loadUsers();
}