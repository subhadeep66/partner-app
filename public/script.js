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
      localStorage.setItem("token", data.token);
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
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      username: document.getElementById("newUser").value,
      password: document.getElementById("newPass").value
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log(data);

    if (!data.success) {
      alert(data.message);
      return;
    }

    loadUsers();
  });
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

let usersVisible = false;

function toggleUsers() {
  const list = document.getElementById("userList");

  if (!usersVisible) {
    loadUsers();
    usersVisible = true;
    event.target.innerText = "Hide Users";
  } else {
    list.innerHTML = "";
    usersVisible = false;
    event.target.innerText = "Show Users";
  }
}