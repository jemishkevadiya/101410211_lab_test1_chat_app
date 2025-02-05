const API_URL = "http://localhost:2222";
const socket = io();
const username = localStorage.getItem("username");
let currentChatUser = null;

if (!username) {
    alert("Username not found. Please log in.");
    window.location.href = "/views/login.html";
}

async function fetchUsers() {
    try {
        const response = await fetch(`${API_URL}/users`);
        const data = await response.json();

        if (response.ok) {
            console.log("User List from API:", data);
        } else {
            console.error("Error fetching users:", data.error || "Unknown error");
        }
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

fetchUsers();

socket.emit("joinPrivateChat", { username });

socket.on("updateUserList", (users) => {
    const userListContainer = document.getElementById("userList");
    userListContainer.innerHTML = "";

    users.forEach((user) => {
        if (user !== username) {
            const userElement = document.createElement("li");
            userElement.classList.add("list-group-item");
            userElement.innerText = user;
            userElement.onclick = () => selectChatUser(user);
            userListContainer.appendChild(userElement);
        }
    });
});

function selectChatUser(user) {
    currentChatUser = user;
    document.getElementById("currentChatUser").innerText = user;
    document.getElementById("messages").innerHTML = "";
}

function sendPrivateMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();

    if (!currentChatUser || message === "") {
        alert("Select a user and type a message.");
        return;
    }

    socket.emit("privateMessage", { from_user: username, to_user: currentChatUser, message });

    const messagesContainer = document.getElementById("messages");
    const messageElement = document.createElement("div");
    messageElement.classList.add("mb-2");
    messageElement.innerHTML = `<strong>You:</strong> ${message}`;
    messagesContainer.appendChild(messageElement);
    messageInput.value = "";
}

socket.on("receivePrivateMessage", (data) => {
    if (data.from_user === currentChatUser) {
        const messagesContainer = document.getElementById("messages");
        const messageElement = document.createElement("div");
        messageElement.classList.add("mb-2");
        messageElement.innerHTML = `<strong>${data.from_user}:</strong> ${data.message}`;
        messagesContainer.appendChild(messageElement);
    }
});

function privateTyping() {
    if (currentChatUser) {
        socket.emit("privateTyping", { from_user: username, to_user: currentChatUser });
    }
}

socket.on("displayPrivateTyping", (typingUser) => {
    document.getElementById("privateTypingIndicator").innerText = typingUser ? `${typingUser} is typing...` : "";
});
