
const API = "http://localhost:3000/tarefas";

let tarefaEditando = null;
let statusEditando = "Pendente";

const formulario = document.getElementById("form-tarefa");
const lista = document.getElementById("lista-tarefas");
const botaoSalvar = formulario.querySelector('button[type="submit"]');

// LISTAR TAREFAS
async function listarTarefas() {
    try {
        const resposta = await fetch(API);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar tarefas");
        }

        const tarefas = await resposta.json();

        lista.innerHTML = "";

        tarefas.forEach((tarefa) => {
            lista.innerHTML += `
                <div class="tarefa">
                    <h3>${tarefa.titulo}</h3>
                    <p>${tarefa.descricao || "Sem descrição"}</p>
                    <p>Prioridade: ${tarefa.prioridade}</p>
                    <p>Status: ${tarefa.status}</p>

                    <button type="button" class="btn-editar" data-id="${tarefa.id}">
                        ✏️ Editar
                    </button>

                    <button type="button" class="btn-excluir" data-id="${tarefa.id}">
                        🗑️ Excluir
                    </button>
                </div>
            `;
        });

    } catch (erro) {
        console.error("Erro ao listar tarefas:", erro);
    }
}

// CADASTRAR E EDITAR TAREFA
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const titulo = document.getElementById("titulo").value.trim();

    if (!titulo) {
        alert("Digite o título da tarefa!");
        return;
    }

    const tarefa = {
        titulo: titulo,
        descricao: document.getElementById("descricao").value.trim(),
        prioridade: document.getElementById("prioridade").value,
        status: tarefaEditando ? statusEditando : "Pendente"
    };

    try {
        const resposta = await fetch(
            tarefaEditando ? `${API}/${tarefaEditando}` : API,
            {
                method: tarefaEditando ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(tarefa)
            }
        );

        if (resposta.ok) {
            alert(
                tarefaEditando
                    ? "Tarefa atualizada com sucesso!"
                    : "Tarefa cadastrada com sucesso!"
            );

            formulario.reset();

            tarefaEditando = null;
            statusEditando = "Pendente";
            botaoSalvar.textContent = "Cadastrar tarefa";

            listarTarefas();

        } else {
            alert("Erro ao salvar tarefa!");
        }

    } catch (erro) {
        console.error("Erro:", erro);
        alert("Não foi possível conectar ao servidor.");
    }
});

// IDENTIFICAR CLIQUES NOS BOTÕES
lista.addEventListener("click", async (evento) => {

    // EDITAR TAREFA
    const botaoEditar = evento.target.closest(".btn-editar");

    if (botaoEditar) {
        const id = botaoEditar.dataset.id;

        const resposta = await fetch(API);
        const tarefas = await resposta.json();

        const tarefa = tarefas.find(item => item.id == id);

        if (!tarefa) {
            alert("Tarefa não encontrada!");
            return;
        }

        document.getElementById("titulo").value = tarefa.titulo;
        document.getElementById("descricao").value = tarefa.descricao || "";
        document.getElementById("prioridade").value = tarefa.prioridade;

        tarefaEditando = id;
        statusEditando = tarefa.status;

        botaoSalvar.textContent = "Salvar alterações";

        formulario.scrollIntoView({
            behavior: "smooth"
        });
    }

    // EXCLUIR TAREFA
    const botaoExcluir = evento.target.closest(".btn-excluir");

    if (botaoExcluir) {
        const id = botaoExcluir.dataset.id;

        const confirmar = confirm("Deseja realmente excluir esta tarefa?");

        if (!confirmar) return;

        const resposta = await fetch(`${API}/${id}`, {
            method: "DELETE"
        });

        if (resposta.ok) {
            alert("Tarefa excluída com sucesso!");
            listarTarefas();
        } else {
            alert("Erro ao excluir tarefa!");
        }
    }
});

// CARREGAR TAREFAS AO ABRIR O SITE
listarTarefas();
