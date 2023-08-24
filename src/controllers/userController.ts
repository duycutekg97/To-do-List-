import UserService from "../services/userService";
const ErrorHandler = require("../utils/errorhander");
import { myDataSource } from "../config/connectDB";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
const crypto = require("crypto");
const sendToken = require("../utils/jwtToken");
import { NextFunction, Request, Response } from "express";
import { ResponseUtil } from "../utils/Response";
const sendEmail = require("../utils/sendEmail");
export default class UserController {
  static handleCreateUser = async (req, res, next) => {
    try {
      // #swagger.tags = ['User']
      if (!req.body.email || !req.body.password) {
        return res.status(500).json({
          message: "Missing input parameter!",
          status: 500,
          error: 'Internal Server Error',
        });
      }

      let userData = await UserService.createUser(req.body);

      return res.status(200).json(userData);
    } catch (e) {
      return res.status(500).json({
        message: e.message,
        status: 500,
        error: 'Internal Server Error',
      });
    }
  };

  static loginUser = async (req, res, next) => {
    // #swagger.tags = ['User']
    if (!req.body.email || !req.body.password) {
      return ResponseUtil.sendErrror(
        res,
        "Please enter your Email & password",
        401,
        null
      );
    }

    const checkEmail = await UserService.checkEmail(req.body.email);

    if (!checkEmail) {
      return ResponseUtil.sendErrror(res, "Invalid Email", 401, null);
    }

    const IspasswordMatched = await UserService.checkUser(
      req.body.email,
      req.body.password
    );
    if (!IspasswordMatched) {
      return ResponseUtil.sendErrror(res, "Invalid password", 401, null);
    }
    const user = await UserService.findUser(req.body.email);

    sendToken(user, 200, res);
    return next;
  };
  static logoutUser = async (req, res, next) => {
    // #swagger.tags = ['User']
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  };
  //     static resetPassword = async (req,res,next) => {
  //         const resetPasswordToken = crypto
  //         .createHash("sha256")
  //         .update(req.params.token)
  //         .digest("hex");

  //         const user = await()
  //     }
  static forgotPassword = async (req, res, next) => {
    try {
      const data = await UserService.getResetPasswordToken(req.body.email);
      if (!data)
        return res.status(200).json({
          sucess: false,
          message: "Not found email",
        });
      const resetPasswordUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/password/reset/${data.resetPasswordToken}`;

      const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;
      try {
        await sendEmail({
          email: data.email,
          subject: `Ecommerce Password Recovery`,
          message,
        });

        await res.status(200).json({
          success: true,
          message: `Email sent to ${data.email} successfully`,
        });
      } catch (error) {
        data.resetPasswordToken = undefined;
        data.resetPasswordExpire = undefined;
        await data.save();
        return error.message;
      }
    } catch (e) {
      return res.status(500).json(e.message);
    }
  };
  static resetPassword = async (req, res, next) => {
    try {
      const user = await UserService.resetPassword(
        req.params.token,
        req.body.password,
        req.body.confirmPassword
      );
      return res.status(200).json(user);
    } catch (e) {
      return e.message;
    }
  };
  static getUserDetails = async (req, res, next) => {
    const user = await UserService.findUser(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  };
  static changePassword = async (req, res, next) => {
    try {
      if (
        !req.body.oldPassword ||
        !req.body.newPassword ||
        !req.body.confirmPassword
      ) {
        return res.status(200).json({
          success: false,
          message: "Missing input parameter",
        });
      }
      const newPass = await UserService.changePassword(
        req.user.id,
        req.body.oldPassword,
        req.body.newPassword,
        req.body.confirmPassword
      );
      if (newPass.success == true) sendToken(newPass.user, 200, res);
      return res.status(200).json(newPass);
    } catch (e) {
      return e.message;
    }
  };
}
