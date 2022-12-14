const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
require("dotenv").config();
const port=process.env.PORT  ||6000;

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
  res.json("server started ");
})

const db="mongodb+srv://ravi1:mongo123@cluster0.20zl3qv.mongodb.net/chatapp?retryWrites=true&w=majority"

mongoose
  .connect(db)
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log("DB Error => ", err));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(port, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    //origin: "https://my-chat-app-ravi.herokuapp.com",
    credentials: true,
  },
});

global.onlineUsers = new Map();//nodejs global object
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => { //add  user and send msg is events
    onlineUsers.set(userId, socket.id);//set the userid and socket id of current user
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
      //socket.to(sendUserSocket).emit("msg-recieve", data.message);
    }
  });
});
