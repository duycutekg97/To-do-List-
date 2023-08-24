import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ResponseUtil } from "../utils/Response"
import { myDataSource } from "../config/connectDB";

exports.isAuthenticatedUser = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return await ResponseUtil.sendErrror(res, "Please Login to access this resource", 401, null);
    }

    const decodedData = jwt.verify(token, process.env.JWT_TOKEN);
    const { userId: id } = decodedData;
    const repo = myDataSource.getRepository("user");
    const user = await repo.findOneByOrFail({ id });
    req.user = user;

    return next();
};
