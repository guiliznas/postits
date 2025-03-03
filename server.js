const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Note = require("./models/Note");
const app = express();
const port = process.env.PORT || 8080;

// Configuração do MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/notes-app";

app.use(express.text());
app.use(express.static("public"));

// Conectar ao MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB:", err));

app.get("/api/notes/*", async (req, res) => {
  const notePath = req.params[0];
  console.log("lendo nota", notePath);

  try {
    const note = await Note.findOne({ path: notePath });
    res.send(note ? note.content : "");
  } catch (error) {
    console.error("Erro ao ler nota:", error);
    res.status(500).send("Erro ao ler nota");
  }
});

app.post("/api/notes/*", async (req, res) => {
  const notePath = req.params[0];
  console.log("salvando nota", notePath);

  try {
    const note = await Note.findOneAndUpdate(
      { path: notePath },
      {
        path: notePath,
        content: req.body,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log("salvo com sucesso");
    res.send("Salvo com sucesso");
  } catch (error) {
    console.error("Erro ao salvar nota:", error);
    res.status(500).send("Erro ao salvar");
  }
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

// Rota catch-all para servir o index.html
app.get("*", (req, res) => {
  console.log("acessando servidor", req.path);
  res.sendFile("index.html", { root: path.join(__dirname, "public") });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log("MONGODB_URI", MONGODB_URI);
});

module.exports = app;
