require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db"); 
const userRoutes = require("./routes/userRoutes"); 
const chatRoutes = require("./routes/chatRoutes");

const GroupMessage = require("./models/GroupMessage");
const PrivateMessage = require("./models/PrivateMessage");

const app = express();
const server = http.createServer(app); 
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

connectDB();

app.use(express.static(path.join(__dirname, "public")));

app.use("/users", userRoutes); 
app.use("/chat", chatRoutes);

let activeUsers = {}; 
let typingUsers = {};

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("joinRoom", ({ username, room }) => {
        socket.join(room);
        activeUsers[socket.id] = { username, room };
        io.to(room).emit("message", { user: "System", message: `${username} has joined ${room}` });
        console.log(`${username} joined ${room}`);
    });

    socket.on("chatMessage", async ({ username, room, message }) => {
        if (!activeUsers[socket.id] || activeUsers[socket.id].room !== room) return;

        io.to(room).emit("message", { user: username, message });

        await new GroupMessage({ from_user: username, room, message }).save();
    });

    socket.on("typing", ({ username, room }) => {
        typingUsers[room] = username;
        socket.broadcast.to(room).emit("displayTyping", username);
    });

    socket.on("stopTyping", ({ room }) => {
        delete typingUsers[room];
        socket.broadcast.to(room).emit("displayTyping", null);
    });

    socket.on("leaveRoom", () => {
        if (activeUsers[socket.id]) {
            const { username, room } = activeUsers[socket.id];
            socket.leave(room);
            delete activeUsers[socket.id];
            io.to(room).emit("message", { user: "System", message: `${username} has left ${room}` });
        }
    });

    socket.on("joinPrivateChat", ({ username }) => {
        activeUsers[socket.id] = username;
        io.emit("updateUserList", Object.values(activeUsers));
    });

    socket.on("privateMessage", async ({ from_user, to_user, message }) => {
        const recipientSocketId = Object.keys(activeUsers).find(
            (key) => activeUsers[key] === to_user
        );

        if (recipientSocketId) {
            io.to(recipientSocketId).emit("receivePrivateMessage", { from_user, message });
        }

        await new PrivateMessage({ from_user, to_user, message }).save();
    });

    socket.on("privateTyping", ({ from_user, to_user }) => {
        const recipientSocketId = Object.keys(activeUsers).find(
            (key) => activeUsers[key] === to_user
        );
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("displayPrivateTyping", from_user);
        }
    });

    socket.on("stopPrivateTyping", ({ to_user }) => {
        const recipientSocketId = Object.keys(activeUsers).find(
            (key) => activeUsers[key] === to_user
        );
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("displayPrivateTyping", null);
        }
    });

    socket.on("disconnect", () => {
        if (activeUsers[socket.id]) {
            const { username, room } = activeUsers[socket.id];
            io.to(room).emit("message", { user: "System", message: `${username} disconnected` });
            delete activeUsers[socket.id];
            io.emit("updateUserList", Object.values(activeUsers));
        }
    });
});

const PORT = process.env.PORT || 3000; 
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
