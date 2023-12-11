const totalConncted = document.querySelector(".totalConncted");
const status = document.querySelector(".status");
const text = document.getElementById("message-input");
const sendBtn = document.getElementById("send-button");
const message = document.getElementById("messageContainer");
const nameDoc = document.querySelector(".name");
const allUserConnect = document.querySelector(".allUserConnect");
const right = document.querySelector(".right");
const left = document.querySelector(".left");
const feedback = document.querySelector(".feedback");

const socket = io(window.location.host);

function init() {
  // communicate to server

  const name = prompt("enter your name : ");

  if (!name) return;

  nameDoc.innerHTML = `You - ${name}`;

  socket.emit("user:add", name);

  socket.on("total:connected", (data) => {
    allUserConnect.innerHTML = "";

    const newUser = data?.filter((entry) => {
      return name !== entry.name;
    });

    newUser.forEach((entry) => {
      const li = `
       <li>${entry?.name}</li>
  `;
      allUserConnect.innerHTML += li;
    });

    totalConncted.textContent = data?.length;
  });

  socket.on("message:recieve", (data) => {
    showMessage(false, data.name, data.message);
  });

  // feedback
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
  }

  function sendMessage() {
    const message = text.value;
    if (!message) return;

    socket.emit("message:send", {
      name: name,
      message: message,
    });

    showMessage(true, name, message);

    text.value = "";
  }

  sendBtn.addEventListener("click", sendMessage);
  document.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // focus
  text.addEventListener("focus", () => {
    socket.emit("feedback:send", name + " " + "is typing...");
  });

  // blur
  text.addEventListener("blur", () => {
    socket.emit("feedback:send", "");
  });

  // onblur
  text.addEventListener("keyup", () => {
    socket.emit("feedback:send", name + " " + "is typing...");
  });
}

document.addEventListener("DOMContentLoaded", init);
