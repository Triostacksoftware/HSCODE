// frontend/src/socket.js
import { io } from "socket.io-client"; 

const socket = io("http://localhost:8000", {
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("Connected with ID:", socket.id);
});

export default socket;
