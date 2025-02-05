const GroupMessage = require("../models/GroupMessage");
const PrivateMessage = require("../models/PrivateMessage");

const validRooms = ["devops", "cloud computing", "covid19", "sports", "nodeJS"];

exports.sendGroupMessage = async (req, res) => {
    try {
        const { from_user, room, message } = req.body;

        if (!from_user || !room || !message) {
            return res.status(400).json({ error: "All fields are required: from_user, room, and message." });
        }

        if (!validRooms.includes(room)) {
            return res.status(400).json({ error: `Invalid room. Valid rooms are: ${validRooms.join(", ")}` });
        }

        const newMessage = new GroupMessage({ from_user, room, message });
        await newMessage.save();

        res.status(201).json({ message: "Message sent successfully", newMessage });
    } catch (err) {
        res.status(500).json({ error: "Failed to send group message." });
    }
};

exports.getGroupMessages = async (req, res) => {
    try {
        const { room } = req.params;

        if (!room) {
            return res.status(400).json({ error: "Room is required." });
        }

        if (!validRooms.includes(room)) {
            return res.status(400).json({ error: `Invalid room. Valid rooms are: ${validRooms.join(", ")}` });
        }

        const messages = await GroupMessage.find({ room }).sort({ date_sent: 1 });

        if (!messages.length) {
            return res.status(404).json({ error: `No messages found in the room: ${room}` });
        }

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch group messages." });
    }
};

exports.sendPrivateMessage = async (req, res) => {
    try {
        const { from_user, to_user, message } = req.body;

        if (!from_user || !to_user || !message) {
            return res.status(400).json({ error: "All fields are required: from_user, to_user, and message." });
        }

        if (from_user === to_user) {
            return res.status(400).json({ error: "Cannot send a private message to yourself." });
        }

        const newMessage = new PrivateMessage({ from_user, to_user, message });
        await newMessage.save();

        res.status(201).json({ message: "Private message sent successfully", newMessage });
    } catch (err) {
        res.status(500).json({ error: "Failed to send private message." });
    }
};

exports.getPrivateMessages = async (req, res) => {
    try {
        const { user1, user2 } = req.params;

        if (!user1 || !user2) {
            return res.status(400).json({ error: "Both users are required." });
        }

        const messages = await PrivateMessage.find({
            $or: [
                { from_user: user1, to_user: user2 },
                { from_user: user2, to_user: user1 }
            ]
        }).sort({ date_sent: 1 });

        if (!messages.length) {
            return res.status(404).json({ error: `No messages found between ${user1} and ${user2}` });
        }

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch private messages." });
    }
};
