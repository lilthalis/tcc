# Controle de Estoque Interativo

Sistema simples e eficiente para gestão de estoque e movimentações (Entradas e Saídas) com persistência de dados local.

## 🚀 Como Executar o Projeto

Existem duas formas principais de visualizar este projeto no seu computador:

### 1. Usando a Extensão "Live Server" (Recomendado)
Se você estiver usando o **VS Code**, esta é a melhor opção pois a página atualiza automaticamente ao salvar arquivos.

1.  Abra o VS Code.
2.  Vá até o ícone de **Extensões** (ou aperte `Ctrl+Shift+X`).
3.  Pesquise por **"Live Server"** (do autor Ritwick Dey) e clique em **Install**.
4.  Com o projeto aberto, clique com o botão direito no arquivo `index.html`.
5.  Selecione **"Open with Live Server"**.
6.  O projeto abrirá automaticamente no seu navegador padrão.

### 2. Abrindo Diretamente no Navegador
Caso não queira instalar nada:

1.  Navegue até a pasta do projeto no seu computador.
2.  Encontre o arquivo `index.html`.
3.  Clique duas vezes nele ou arraste-o para dentro de uma aba do seu navegador (Chrome, Edge, Firefox, etc).

## 🛠️ Tecnologias Utilizadas
*   **HTML5 & CSS3:** Estruturação e layout responsivo com Grid e Flexbox.
*   **JavaScript (Vanilla):** Lógica do sistema e manipulação do DOM.
*   **LocalStorage:** Para salvar seus dados diretamente no navegador (os dados não somem ao fechar a página).

## 📋 Funcionalidades
*   **Entrada de Itens:** Adicione novos produtos ou aumente a quantidade de itens existentes.
*   **Saída de Itens:** Registre retiradas especificando quem está retirando.
*   **Estoque Atual:** Tabela com busca em tempo real e paginação (5 itens por página).
*   **Histórico:** Registro completo de todas as ações com data, hora e cores indicativas (Verde para Entrada, Vermelho para Saída).
*   **Alertas:** Notificações visuais de sucesso ou erro integradas ao layout.

---
Desenvolvido para fins educacionais e de gestão simplificada.
