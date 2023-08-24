import { DataSource } from "typeorm"
require('dotenv').config();

const port = process.env.PORT_DB || 3306;
export const myDataSource = new DataSource({
    type: "mysql",
    host: process.env.HOST || '127.0.0.1',
    port: +port,
    username: 'root',
    password: "",
    database: "intern_demo",
    entities: ["src/entity/*.ts"],
    logging: false,
    // dropSchema: true,
    synchronize: true,
    timezone: 'Z'
})

export let connectDB = myDataSource
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    })