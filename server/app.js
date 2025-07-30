import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import multer from "multer";

dotenv.config();

// express app
const app = express();

// imports routes
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import { getIpLocation } from "./utilities/ip.util.js";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop()
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

// routes
app.get("/", (req, res) => {
  res.send("You have to login first");
});

app.get("/api/v1", (req, res) => {
  res.send("You have to login first");
});

app.get("/api/v1/get-country", async (req, res) => {
  try {
    console.log("hit");
    const location = await getIpLocation(req);
    res.status(200).json({ location });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);

export default app;
