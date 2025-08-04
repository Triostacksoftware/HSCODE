// frontend/src/socket.js
import { io } from "socket.io-client"; 

const socket = io("http://localhost:3000", {
  query: {
    userId: "user123"
  },
  withCredentials: true // if you’re using credentials/CORS
});  

socket.on("connect", () => {
  console.log("Connected with ID:", socket.id);
});

export default socket;
