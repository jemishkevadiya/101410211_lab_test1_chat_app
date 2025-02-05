const API_URL = "http://localhost:2222";
const socket = io();
let currentRoom = null;
const username = localStorage.getItem("username");

if (!username) {
    alert("Username not found. Please log in.");
    window.location.href = "/views/login.html";
}

async function fetchRooms() {
    try {
        const response = await fetch(`${API_URL}/rooms`);
        const data = await response.json();

        if (response.ok) {
            console.log("Available Rooms from API:", data);
        } else {
            console.error("Error fetching rooms:", data.error || "Unknown error");
        }
    } catch (error) {
        console.error("Error fetching rooms:", error);
    }
}

fetchRooms();

function joinRoom(room) {
    try {
        currentRoom = room;
        document.getElementById("messages").innerHTML = "";
        socket.emit("joinRoom", { username, room });
    } catch (error) {
        console.error("Error joining room:", error);
        alert("Failed to join the room. Please try again.");
    }
}

function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();

    if (message === "") return;

    try {
        socket.emit("chatMessage", { username, room: currentRoom, message });
        messageInput.value = "";
    } catch (error) {
        console.error("Error sending message:", error);
        alert("Failed to send message. Please try again.");
    }
}

socket.on("message", (data) => {
    const messagesContainer = document.getElementById("messages");
    const messageElement = document.createElement("div");
    messageElement.classList.add("mb-2");
    messageElement.innerHTML = `<strong>${data.user}:</strong> ${data.message}`;
    messagesContainer.appendChild(messageElement);
});

function typing() {
    if (currentRoom) {
        socket.emit("typing", { username, room: currentRoom });
    }
}

socket.on("displayTyping", (typingUser) => {
    document.getElementById("typingIndicator").innerText = typingUser ? `${typingUser} is typing...` : "";
});

function leaveRoom() {
    try {
        socket.emit("leaveRoom");
        document.getElementById("messages").innerHTML = "";
        alert("You left the room.");
    } catch (error) {
        console.error("Error leaving room:", error);
        alert("Failed to leave the room. Please try again.");
    }
}
