import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { sql }from "./config/db.js";
import { aj } from "./lib/arcjet.js";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

dotenv.config();

app.use(express.json());
app.use(helmet());  //  helmet is a security middleware that helps protect your app from common vulnerabilities by setting various HTTP headers
app.use(morgan("dev")); // morgan is a logging middleware that helps you log requests to your app

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(async (req, res, next) => {
    try {
        const decision = await aj.protect(req, {
            requested: 1,
        });

        if (decision.isDenied()) {
            if(decision.reason.isRateLimit()){
                return res.status(429).json({ success: false, message: "Too many requests" });
            } else if (decision.reason.isBot()) {
                return res.status(403).json({ success: false, message: "You are a bot" });
            } else {
                res.status(403).json({ success: false, message: "Forbidden" });
            }
        return
        } 
        
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
})

import productRoutes from "./routes/productRoutes.js";
app.use("/api/products", productRoutes);

if (process.env.NODE_ENV === "production") {
  // server our react app
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}


async function initDB() {
    try {   // sql is a function that is used as a tagged template literal which allows us to write SQL queries safe way 
        await sql`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                image VARCHAR(255) NOT NULL,
                price DECIMAL(100, 2) NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
    `
    }   
    catch (error) {
        console.log(error);
    }
}

app.get("/test", (req, res) => {
    console.log(res.getHeaders());
    res.send("Hello World!");
});

initDB().then(() => {
    app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
    });
})