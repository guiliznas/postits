function markdownToHtml(text) {
  return text
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.*)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*)\*/g, "<i>$1</i>")
    .replace(/\n/g, "<br>");
}

const urlParams = new URLSearchParams(window.location.search);
const readMode = urlParams.get("read") === "true";
const pagePath = window.location.pathname.slice(1); // Remove a barra inicial

async function loadContent(path) {
  if (!path) {
    return null; // Página inicial
  }
  try {
    const response = await fetch(`/api/notes/${path}`);
    const data = await response.text();
    return data;
  } catch (error) {
    console.error("Erro ao carregar conteúdo:", error);
    return "";
  }
}

async function saveContent(path, content) {
  try {
    await fetch(`/api/notes/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: content,
    });
  } catch (error) {
    console.error("Erro ao salvar:", error);
  }
}

async function init() {
  const editorDiv = document.getElementById("editor");

  if (!pagePath) {
    // Página inicial
    editorDiv.innerHTML = `
          <div id="home">
              <h1>Bem-vindo ao Simple Notes</h1>
              <p>Este é um sistema simples de notas baseado em URL:</p>
              <ul>
                  <li>Acesse /nome-da-pagina para criar/editar uma nota</li>
                  <li>Adicione ?read=true para modo leitura</li>
                  <li>Suporta múltiplos níveis como /pagina/subpagina</li>
                  <li>Markdown básico suportado (#, ##, **, *)</li>
              </ul>
          </div>
      `;
    return;
  }

  const content = await loadContent(pagePath);

  if (readMode) {
    editorDiv.innerHTML = markdownToHtml(content || "Nada escrito ainda");
  } else {
    const textarea = document.createElement("textarea");
    textarea.id = "content";
    textarea.value = content || "";

    const saveButton = document.createElement("button");
    saveButton.id = "saveBtn";
    saveButton.textContent = "Salvar";

    editorDiv.appendChild(textarea);
    editorDiv.appendChild(saveButton);

    let lastContent = textarea.value;
    textarea.addEventListener("input", () => {
      if (textarea.value !== lastContent) {
        lastContent = textarea.value;
        saveContent(pagePath, textarea.value);
      }
    });

    saveButton.addEventListener("click", () => {
      saveContent(pagePath, textarea.value);
      alert("Salvo com sucesso!");
    });
  }
}

document.addEventListener("DOMContentLoaded", init);
