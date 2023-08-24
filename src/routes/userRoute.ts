import express from "express";
import UserController from "../controllers/userController";
import { ErrorHandler } from "../utils/errorhander";
const { isAuthenticatedUser } = require("../middleware/auth");
import UserService from "../services/userService";
const router = express.Router();


router.route('/api/v1/register').post(UserController.handleCreateUser);
router.route('/api/v1/login').post(UserController.loginUser);
router.route('/api/v1/logout').get(ErrorHandler.catchErrors(isAuthenticatedUser), UserController.logoutUser);
router.route('/api/v1/changePassword').put(isAuthenticatedUser, UserController.changePassword);
router.route("/api/v1/me").get(isAuthenticatedUser, UserController.getUserDetails);
router.route('/api/v1/getResetpassword').post(UserController.forgotPassword);
router.route('/api/v1/password/reset/:token').put(UserController.resetPassword);
module.exports = router;