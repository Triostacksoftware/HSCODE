import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import getCountry from "./utilities/location.util.js";
import fs from "fs";

dotenv.config();

// express app
const app = express();

// imports routes
import authRoutes from "./routes/auth.routes.js";
import groupsRoutes from "./routes/groups.routes.js";
import userRoutes from "./routes/user.routes.js";
import leadsRoutes from "./routes/approvedLeads.js";
import requestedLeadsRoutes from "./routes/requestedLeads.routes.js";
import globalGroupRoutes from "./routes/globalGroup.routes.js";
import globalLeadsRoutes from "./routes/globalLeads.routes.js";
import superadminRoutes from "./routes/superadmin.routes.js";
import homeDataRoutes from "./routes/homeData.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import userChatRoutes from "./routes/userChat.routes.js";

// Read country-wise file mapping
const hscodes = fs.readFileSync("db/country-wise-file.csv", "utf8");
const mapHscodes = new Map();

const lines = hscodes.split("\n");
lines.forEach((line, index) => {
  // Skip header row and empty lines
  if (index === 0 || !line.trim()) return;

  const [filename, countryCode] = line.split(",");
  if (filename && countryCode) {
    mapHscodes.set(countryCode.trim(), filename.trim());
  }
});

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.use(
  cors({
    origin: [
      process.env.ORIGIN || "http://localhost:3000",
      "https://hscodes.com"
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use("/api/v1/upload", express.static("public/uploads"));
app.use("/api/v1/leadDocuments", express.static("public/leadDocuments"));

// routes
app.get("/", (req, res) => {
  res.send("You have to login first");
});

app.get("/api/v1", (req, res) => {
  res.send("You have to login first");
});

// Test cookie endpoint
app.get("/api/v1/test-cookie", (req, res) => {
  res.cookie("test_cookie", "test_value", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res.json({ message: "Test cookie set", cookies: req.cookies });
});

// Unified country detection endpoint
app.get("/api/v1/location", async (req, res) => {
  try {
    const ip = req.ip;
    const result = await getCountry(ip);
    res.status(200).json(result);
  } catch (error) {
    console.error("Location endpoint error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Direct file access by filename
app.get("/api/v1/hscodes", (req, res) => {
  try {
    const { countryCode } = req.query;
    const filename = mapHscodes.get(countryCode);
    console.log(filename);
    const filePath = `public/CSVs/${filename}.csv`;
    console.log(filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: `File not found: ${filename}.csv`,
      });
    }
    console.log(filePath);
    // Set proper headers for CSV download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}.csv"`
    );

    // Stream the file directly
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error serving HS code file:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/groups", groupsRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/leads", leadsRoutes);
app.use("/api/v1/requested-leads", requestedLeadsRoutes);

// Global routes
app.use("/api/v1/global-groups", globalGroupRoutes);
app.use("/api/v1/global-leads", globalLeadsRoutes);
app.use("/api/v1/superadmin", superadminRoutes);
app.use("/api/v1/home-data", homeDataRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/user-chat", userChatRoutes);

export default app;
