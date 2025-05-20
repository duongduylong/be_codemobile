
// routes/user.route.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const auth = require("../middlewares/auth");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/history", auth, userController.getUserHistory);
router.get("/profile", auth, userController.getProfile);
router.put("/update", auth, userController.updateInfo);
router.put("/update-password", auth, userController.updatePassword);
router.get("/", userController.getUsers);
router.get("/listHistory", userController.getListHistory);
module.exports = router;

