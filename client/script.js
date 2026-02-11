const socket = io();

const nameScreen = document.getElementById("nameScreen");
const chatApp = document.getElementById("gridContainer");
const nameInput = document.getElementById("nameInput");
const joinBtn = document.getElementById("joinBtn");
const messages = document.getElementById("messages");
const form = document.getElementById("grpMsgForm");
const input = document.getElementById("grpMsgInput");
const connectionStatus = document.getElementById("connectionStatus");

let myNickName = "";

const messaging = (msgsArea, name, msg) => {
  const item = document.createElement("li");
  item.textContent = `${name}: ${msg}`;
  msgsArea.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
};

const handleJoin = () => {
  if (nameInput.value.trim()) {
    myNickName = nameInput.value;
    nameScreen.style.display = "none";
    chatApp.style.display = "grid";
    connectionStatus.innerText = `Hello ${myNickName}, you connected successfully!`;
    socket.emit("new user", myNickName);
  }
};

const handleTyping = (nickName) => {
  const item = document.createElement("li");
  item.style.fontStyle = "italic";
  item.style.color = "gray";
  item.textContent = `${nickName} is typing.`;
  messages.appendChild(item);
};

joinBtn.onclick = handleJoin;
nameInput.onkeypress = (e) => {
  if (e.key === "Enter") handleJoin();
};

form.onsubmit = (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("group message", myNickName, input.value);
    messaging(messages, "me", input.value);
    input.value = "";
  }
};

socket.on("new user", (nickName) => {
  const item = document.createElement("li");
  item.style.fontStyle = "italic";
  item.style.color = "gray";
  item.textContent = `${nickName} has joined the chat.`;
  messages.appendChild(item);
});

socket.on("group message", (nickName, msg) => {
  messaging(messages, nickName, msg);
});

socket.on("typing", (nickName) => {
  handleTyping(nickName);
});

socket.on("user left", (userNickName) => {
  if (userNickName) {
    const item = document.createElement("li");
    item.style.fontStyle = "italic";
    item.style.color = "red";
    item.textContent = `${userNickName} has left the chat.`;
    messages.appendChild(item);
  }
});

input.oninput = () => {
  socket.emit("userIsTyping", myNickName);
};
input.onchange = () => {
  socket.emit("userIsNotTyping");
};

socket.on("userIsTyping", (nickName) => {
  const typing = document.getElementById("typing");
  typing.textContent = `${nickName} is typing`;
});

socket.on("userIsNotTyping", () => {
  const typing = document.getElementById("typing");
  typing.textContent = ``;
});

socket.on("usersList", (users) => {
  const connectedUsers = document.getElementById("connectedUsers");
  connectedUsers.innerHTML = "";
  for (let id in users) {
    const nickname = users[id];
    const user = document.createElement("li");
    user.textContent = nickname;
    connectedUsers.append(user);

    const sendMsgBtn = document.createElement("button");
    sendMsgBtn.textContent = `Send Private message to ${nickname}`;
    const cantsendMsg = document.createElement("span");
    cantsendMsg.textContent = `Can't Send Private message top yourself`;

    if (id !== socket.id) {
      connectedUsers.appendChild(sendMsgBtn);
    } else {
      connectedUsers.appendChild(cantsendMsg);
    }
  }
});
