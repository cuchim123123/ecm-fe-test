import { io } from "socket.io-client";
import { API_BASE_URL } from "./config"; // Đảm bảo bạn import đúng biến này

// URL gốc của Backend (Bỏ đuôi /api nếu có)
const SOCKET_URL = API_BASE_URL.replace("/api", "");

let socket;

export const initSocket = (userId) => {
  // Nếu đã kết nối rồi thì không tạo mới, chỉ join room nếu cần
  if (socket?.connected) {
    if (userId) socket.emit("join_user_room", userId);
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ["websocket"], // Bắt buộc
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket.id);
    if (userId) {
      console.log("👤 Joining room for user:", userId);
      socket.emit("join_user_room", userId);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected");
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
