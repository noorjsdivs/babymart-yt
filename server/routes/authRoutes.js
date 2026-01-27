import express from "express";
import { getUserProfile, logoutUser, registerUser } from "../controllers/authController.js";
import { loginUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// register route
router.post("/register", registerUser)  

// login route 
 
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login    
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *           example:
 *             email: "user@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 avatar:
 *                   type: string
 *                 role:
 *                   type: string
 *                 addresses:
 *                   type: array
 *                   items:
 *                     type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid email or password
 */

// login route 

router.post("/login", loginUser); 

//profile
router.get("/profile", protect, getUserProfile);

// logout
router.post("/logout", protect, logoutUser);

// router.post("/login", (req, res) => {
// res.send({ message: "Login working" });
// });

export default router;   