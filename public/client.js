const totalConncted = document.querySelector(".totalConncted");
// const status = document.querySelector(".status");
const text = document.getElementById("message-input");
const sendBtn = document.getElementById("send-button");

const messageList = document.getElementById("message-list");

const allUserConnect = document.querySelector(".allUserConnect");

const right = document.querySelector(".right");
const left = document.querySelector(".left");

const feedback = document.querySelector(".feedback");
const roomDoc = document.getElementById("room");
const nameDoc = document.querySelector(".name");

const socket = io(window.location.host);

const query = new URLSearchParams(window.location.search);
const room = query.get("room");
const username = query.get("username");

// Join chatroom
socket.emit("joinRoom", { username, room });

// user name
nameDoc.innerHTML = `You (${username})`;

socket.on("roomUsers", (data) => {
  roomDoc.innerHTML = data.room;
  allUserConnect.innerHTML = "";

  data?.users?.forEach((entry) => {
    const li = `
       <li class="list">${entry?.username}</li>
  `;
    allUserConnect.innerHTML += li;
  });

  totalConncted.textContent = data?.users?.length;
});

socket.on("message", (data) => {
  showMessage(false, data.username, data.text);
});

//   // feedback
socket.on("feedback:recieved", (data) => {
  feedback.innerHTML = data;
});

function showMessage(isBool, name, message) {
  const newMessage = `
    <div class="messageChat">
    <p>${name}</p>
    <p class="name">${message}</p>
    </div>
    `;
  if (isBool) {
    right.innerHTML += newMessage;
    // right side  - send end
  } else {
    left.innerHTML += newMessage;
    // left side - receiver end
  }
  messageList.scrollTop = message.scrollHeight;
  // Scroll down
  left.scrollTop = left.scrollHeight;
  right.scrollTop = right.scrollHeight;
}

function sendMessage() {
  const message = text.value;

  if (!message) return;
  socket.emit("chatMessage", message);

  showMessage(true, username, message);

  text.value = "";

  text.value.focus();
}

// send message to socket
sendBtn.addEventListener("click", sendMessage);

// key up
document.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// focus
text.addEventListener("focus", () => {
  socket.emit("feedback:send", username + " " + "is typing...");
});
// blur
text.addEventListener("blur", () => {
  socket.emit("feedback:send", "");
});
// onblur
text.addEventListener("keyup", () => {
  socket.emit("feedback:send", username + " " + "is typing...");
});
