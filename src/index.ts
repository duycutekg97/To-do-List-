import express from "express";
import bodyParser from "body-parser";
//import { initWebRoutes } from "./routes/web";
import { connectDB } from "./config/connectDB";
import cors from "cors";
require('dotenv').config();
import swaggerUi from "swagger-ui-express";
import swaggerFile from "../swagger-output.json";


let app = express();
app.use(cors({ credentials: true, origin: true }));
const cookieParser = require("cookie-parser");


app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

connectDB;

const userRoute = require("./routes/userRoute");
const projectRoute = require("./routes/projectRoute");
const taskRoute = require("./routes/taskRoute");
const dashboardRoute = require("./routes/dashboardRoute");
app.use("/", userRoute);
app.use("/", projectRoute);
app.use("/", taskRoute);
app.use("/", dashboardRoute);
app.use("*", (req, res) => {
    return res.status(404).json({
        success: false,
        message: "Invalid route"
    })
});

let port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log('BackEnd NodeJS is running on the port: ', port);
})