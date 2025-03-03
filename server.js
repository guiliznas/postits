const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const app = express();
const port = process.env.PORT || 8080;

const NOTES_DIR = "notes";

app.use(express.text());
app.use(express.static("public"));

// Cria o diretório notes se não existir
async function ensureNotesDir() {
  try {
    await fs.mkdir(NOTES_DIR, { recursive: true });
  } catch (error) {
    console.error("Erro ao criar diretório:", error);
  }
}

app.get("/api/notes/*", async (req, res) => {
  const notePath = req.params[0];
  console.log("lendo nota", notePath);
  const filePath = path.join(NOTES_DIR, `${notePath}.txt`);

  try {
    const content = await fs.readFile(filePath, "utf8");
    res.send(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      res.send("");
    } else {
      res.status(500).send("Erro ao ler nota");
    }
  }
});

app.post("/api/notes/*", async (req, res) => {
  const notePath = req.params[0];
  console.log("salvando nota", notePath);
  const filePath = path.join(NOTES_DIR, `${notePath}.txt`);

  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, req.body);
    console.log("salvo com sucesso");
    res.send("Salvo com sucesso");
  } catch (error) {
    res.status(500).send("Erro ao salvar");
  }
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

// Adicionar esta rota catch-all para servir o index.html
app.get("*", (req, res) => {
  console.log("acessando servidor", req.path);
  res.sendFile("index.html", { root: path.join(__dirname, "public") });
});

async function start() {
  await ensureNotesDir();
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

start();

module.exports = app;
