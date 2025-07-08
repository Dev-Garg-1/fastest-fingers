import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getLeaderboard, getMySessions, submitSession } from "../controllers/TypingSession.controller.js";

const router = Router();

router.route("/leaderboard").get(getLeaderboard)

//secured routes
router.route("/").post(verifyJWT, submitSession)
router .route("/me").get(verifyJWT, getMySessions)

export default router