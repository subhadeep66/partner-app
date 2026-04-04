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
function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(sec => {
    sec.style.display = "none";
  });

  document.getElementById(sectionId).style.display = "block";

  if (sectionId === "campaigns") {
    loadCampaigns();
  }
}

showSection("campaigns");


function addApp() {
  fetch("/add-app", {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
     "Authorization": localStorage.getItem("token") || ""
    },
    body: JSON.stringify({
      name: document.getElementById("appName").value,
      status: document.getElementById("appStatus").value,
      platform: document.getElementById("platform").value,
      revenue: document.getElementById("revenue").value
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert("Campaign added ✅");
    } else {
      alert("Error ❌");
    }
  });
}

let allCampaigns = [];

function loadCampaigns() {
  fetch("/campaigns")
    .then(res => res.json())
    .then(data => {
      allCampaigns = data;
      renderCampaigns(data);
    });
}

function renderCampaigns(data) {
  const list = document.getElementById("campaignList");
  list.innerHTML = "";

  data.forEach(c => {
    const li = document.createElement("li");
    li.innerText = `${c.appName} | ${c.status} | ${c.owner}`;
    list.appendChild(li);
  });
}