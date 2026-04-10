const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");

// Get username & room
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
console.log(username, room);

const socket = io();

// Join room
socket.emit("joinRoom", { username, room });

// Get users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// ✅ RECEIVE MESSAGE 
socket.on("message", (message) => {
  outputMessage(message);

  // scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Send message
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;

  socket.emit("chatMessage", msg);

  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Display message
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");

  div.innerHTML = `
    <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">${message.text}</p>
  `;

  document.querySelector(".chat-messages").appendChild(div);
}

// Room name
const roomName = document.getElementById("room-name");
function outputRoomName(room) {
  roomName.innerText = room;
}

// Users list
const userList = document.getElementById("users");
function outputUsers(users) {
  userList.innerHTML = users.map(user => `<li>${user.username}</li>`).join("");
}