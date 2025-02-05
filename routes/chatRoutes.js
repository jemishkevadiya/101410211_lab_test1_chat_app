const express = require("express");
const {
    sendGroupMessage,
    getGroupMessages,
    sendPrivateMessage,
    getPrivateMessages
} = require("../controllers/chatController");

const router = express.Router();

router.post("/group-message", sendGroupMessage);
router.get("/group-messages/:room", getGroupMessages);
router.post("/private-message", sendPrivateMessage);
router.get("/private-messages/:user1/:user2", getPrivateMessages);

module.exports = router;
