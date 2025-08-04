// frontend/src/socket.js
import { io } from "socket.io-client"; 

const socket = io("http://localhost:8000", {
  query: {
    userId: new Date().toLocaleString()
  },
  withCredentials: true // if you’re using credentials/CORS
});  


socket.on("connect", () => {
  console.log("Connected with ID:", socket.id);
});

socket.on("online-users-list", (users) => {
  console.log("Online users:", users);
});

export default socket;
