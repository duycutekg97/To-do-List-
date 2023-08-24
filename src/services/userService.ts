import { parseJsonText } from "typescript";
import { myDataSource } from "../config/connectDB";
import { User } from "../entity/User";
import { compare, hash } from "bcryptjs";
import { IsNull } from "typeorm";
const crypto = require("crypto");

let userRepository = myDataSource.getRepository(User);

export default class UserService {
    static createUser = async (userInput) => {
        const findUser = await userRepository.findOneBy({
            email: userInput.email
        })
        if (findUser) {
            return ({
                message: 'Email already exists!'
            })
        }
        const reg = new User();
        reg.email = userInput.email;
        reg.password = userInput.password;
        reg.firstName = userInput.email;

        //const user = await userRepository.create(userInput);
        const user = await userRepository.create(reg);
        let userData = await userRepository.save(user);
        return ({
            message: 'Create user successful!',
            status: 200,
            error: null,
            user: user
        })
    }

    static checkEmail = async (email) => {
        const repo = myDataSource.getRepository("user");
        const user = await repo.findOneBy({ email: email });
        if (!user) {
            return false;
        }
        return true;
    }

    static checkUser = async (email, password) => {
        const repo = myDataSource.getRepository("user");
        const user = await repo.findOneBy({ email });
        if (!user) {
            return false;
        }
        const IspasswordMatched = await compare(password, user.password);
        if (!IspasswordMatched) {
            return false;
        }
        return true;
    }

    static findUser = async (email) => {
        const repo = myDataSource.getRepository("user");
        const user = await repo.findOneBy({ email: email });
        if (!user)
            return null;
        return user;

    }

    static getResetPasswordToken = async (email) => {
        const repo = myDataSource.getRepository("user");
        const user = await repo.findOneBy({ email: email });
        const resetToken = crypto.randomBytes(10).toString("hex");
        if (!user)
            return email;
        const token = crypto.createHash("sha256").update(resetToken).digest("hex")
        user.resetPasswordToken = token;
        // console.log(Date.now());
        const date = Date.now() + 7 * 3600 * 1000;
        //console.log(date);
        const newDate = await new Date(date + 15 * 60 * 1000);
        // console.log(new Date(date));
        //console.log(newDate);
        user.resetPasswordExpire = newDate;

        //user.resetPasswordExpire = 1;

        const userUpdate = repo.save(user);
        return userUpdate;
    }

    static findWithResetPasswordToken = async (passwordtoken) => {
        const repo = await myDataSource.getRepository("user");
        const findUser = await repo.findOneBy({ resetPasswordToken: passwordtoken });
        if (!findUser) {
            return false;
        }
        return findUser;
    }

    static resetPassword = async (token, password, confirmPassword) => {
        const repo = await myDataSource.getRepository("user");
        const user = await repo.findOneBy({ resetPasswordToken: token });
        if (!user) {
            return {
                success: false,
                message: 'Reset Password invalid'
            };
        }
        const noww = Date.now() + 7 * 3600 * 1000;
        console.log(user.resetPasswordExpire.getTime() - noww < 15 * 60 * 1000);
        if (user.resetPasswordExpire.getTime() - noww > 15 * 60 * 1000) {
            return {
                success: false,
                message: 'Reset Password Token has been expired'
            };
        }
        if (password !== confirmPassword) {
            return {
                success: false,
                message: "Password does not password",
            }
        }
        user.password = await hash(password, 12);
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        await repo.save(user);
        return user;


    }

    static changePassword = async (id, password, newPassword, confirmPassword) => {
        const user = await userRepository.findOneBy(id);
        if (!user)
            return {
                success: false,
                message: "Not find id changePassword"
            }
        const isPasswordMatched = await compare(password, user.password);

        if (!isPasswordMatched) {
            return {
                success: false,
                message: "Old password is correct"
            }
        }
        if (newPassword !== confirmPassword) {
            return {
                success: false,
                message: "Password does not match"
            }
        }
        newPassword = await hash(newPassword, 12);
        user.password = newPassword;
        await user.save();
        return { user, success: true };
    }

    static

}