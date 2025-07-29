import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// ✅ Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ CORS settings
app.use(cors({
  origin: "*", // ⚠️ In production, use exact domain: "https://yourdomain.com"
  credentials: true,
}));

// ✅ JSON body parser
app.use(express.json({ limit: "4mb" }));

// ✅ Socket.IO setup
export const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*", // ⚠️ Change this to your frontend domain in production
    methods: ["GET", "POST"],
  },
});

// ✅ Track online users
export const userSocketMap = {};

// ✅ WebSocket connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (!userId) {
    console.log("⚠️ Missing userId in handshake, disconnecting socket");
    socket.disconnect(true);
    return;
  }

  console.log("✅ User connected:", userId);
  userSocketMap[userId] = socket.id;

  // ✅ Broadcast online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("❌ User Disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// ✅ Health check route
app.get("/api/status", (req, res) => {
  res.send("✅ Server is alive");
});

// ✅ API routes
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// ✅ Start server
const PORT = process.env.PORT || 5000;

const init = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server is running at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

init();
