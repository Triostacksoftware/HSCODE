import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

// express app
const app = express();

// imports routes
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import userRoutes from "./routes/user.routes.js";
import leadsRoutes from "./routes/leads.routes.js";
import requestedLeadsRoutes from "./routes/requestedLeads.routes.js";
import globalCategoryRoutes from "./routes/globalCategory.routes.js";
import globalGroupRoutes from "./routes/globalGroup.routes.js";
import globalLeadsRoutes from "./routes/globalLeads.routes.js";
import superadminRoutes from "./routes/superadmin.routes.js";
import { getIpLocation } from "./utilities/ip.util.js";

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
    origin: process.env.ORIGIN,
    credentials: true,
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

app.get("/api/v1/get-country", async (req, res) => {
  try {
    console.log("hit");
    const location = await getIpLocation(req);
    res.status(200).json({ location });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/v1/get-countrycode", async (req, res) => {
  try {
    const location = await getIpLocation(req);
    res.status(200).json({ countryCode: location.countryCode });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/leads", leadsRoutes);
app.use("/api/v1/requested-leads", requestedLeadsRoutes);

// Global routes
app.use("/api/v1/global-categories", globalCategoryRoutes);
app.use("/api/v1/global-groups", globalGroupRoutes);
app.use("/api/v1/global-leads", globalLeadsRoutes);
app.use("/api/v1/superadmin", superadminRoutes);

export default app;
