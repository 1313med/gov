const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/qaController");

router.get("/", ctrl.listQuestions);
router.get("/:slug", ctrl.getQuestion);
router.post("/", protect, ctrl.createQuestion);
router.post("/:slug/answers", protect, ctrl.addAnswer);
router.post("/:slug/vote", protect, ctrl.voteQuestion);
router.post("/:slug/answers/:answerId/vote", protect, ctrl.voteAnswer);
router.post("/:slug/answers/:answerId/accept", protect, ctrl.acceptAnswer);

module.exports = router;
