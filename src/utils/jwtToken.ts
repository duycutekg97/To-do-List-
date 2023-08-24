// Create Token and saving in cookie
import { sign } from "jsonwebtoken";
const sendToken = (user, statusCode, res) => {
    const token = sign({ userId: user.id }, process.env.JWT_TOKEN, {
        expiresIn: "30m",
    })

    // options for cookie
    const options = {
        expires: new Date(
            Date.now() + 1 * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };
    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user,
        token,
    });
};

module.exports = sendToken;