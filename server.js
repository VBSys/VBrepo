const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json()); // permite receber JSON
app.use(express.static(path.join(__dirname, "../frontend"))); // serve o frontend

// Dados simulados
const users = [];
const agendamentos = [];
const horasComplementares = [];

// Rotas básicas
app.post("/users", (req, res) => {
  const novo = { id: users.length + 1, ...req.body };
  users.push(novo);
  res.status(201).json(novo);
});

app.get("/users", (req, res) => {
  res.json(users);
});

app.post("/agendar", (req, res) => {
  const novo = { id: agendamentos.length + 1, ...req.body };
  agendamentos.push(novo);
  res.status(201).json(novo);
});

app.get("/agenda/:userId", (req, res) => {
  const userId = Number(req.params.userId);
  const agenda = agendamentos.filter(
    (a) => a.voluntarioId === userId || a.beneficiarioId === userId
  );
  res.json(agenda);
});

app.post("/horas", (req, res) => {
  const novo = { id: horasComplementares.length + 1, ...req.body };
  horasComplementares.push(novo);
  res.status(201).json(novo);
});

app.get("/horas/:voluntarioId", (req, res) => {
  const id = Number(req.params.voluntarioId);
  const total = horasComplementares
    .filter((h) => h.voluntarioId === id)
    .reduce((acc, h) => acc + h.duracao, 0);
  res.json({ voluntarioId: id, totalHoras: total });
});

// Chat com Socket.IO
io.on("connection", (socket) => {
  console.log("Novo usuário conectado");

  socket.on("chat message", ({ userId, username, msg }) => {
    const mensagemFormatada = `${username || "Usuário"}: ${msg}`;
    io.emit("chat message", mensagemFormatada);
  });

  socket.on("disconnect", () => {
    console.log("Usuário desconectado");
  });
});

server.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
