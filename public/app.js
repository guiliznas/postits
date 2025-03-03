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
const pagePath = window.location.pathname.slice(1);

async function loadContent(path) {
  if (!path) {
    return null;
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

function createCopyLink() {
  const link = document.createElement("a");
  link.href = "#";
  link.textContent = "Compartilhar";
  link.style.marginTop = "10px";
  link.style.display = "inline-block";

  link.addEventListener("click", (e) => {
    e.preventDefault();
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        const originalText = link.textContent;
        link.textContent = "URL copiada!";
        setTimeout(() => {
          link.textContent = originalText;
        }, 2000);
      })
      .catch((err) => {
        console.error("Erro ao copiar:", err);
      });
  });

  return link;
}

async function init() {
  const editorDiv = document.getElementById("editor");

  if (!pagePath) {
    editorDiv.innerHTML = `
          <div id="home">
              <h1>Bem-vindo ao Simple Notes</h1>
              <p>Este é um sistema simples de notas baseado em URL:</p>
              <ul>
                  <li>Acesse /nome-da-pagina para criar/editar uma nota</li>
                  <li>Adicione ?read=true para modo leitura</li>
                  <li>Suporta múltiplos níveis como /pagina/subpagina</li>
                  <li>Markdown básico suportado (#, ##, **, *)</li>
                  <li>Tudo é salvo automaticamente ao digitar</li>
              </ul>
          </div>
      `;
    return;
  }

  const content = await loadContent(pagePath);
  const copyLink = createCopyLink();

  if (readMode) {
    editorDiv.innerHTML = markdownToHtml(content || "Nada escrito ainda");
    editorDiv.appendChild(document.createElement("br"));
    editorDiv.appendChild(copyLink);
  } else {
    const textarea = document.createElement("textarea");
    textarea.id = "content";
    textarea.value = content || "";
    editorDiv.appendChild(textarea);
    editorDiv.appendChild(document.createElement("br"));
    editorDiv.appendChild(copyLink);

    textarea.addEventListener("input", () => {
      saveContent(pagePath, textarea.value);
    });
  }
}

document.addEventListener("DOMContentLoaded", init);
