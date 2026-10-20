# ⚔️ RPG Master

Um jogo de RPG medieval feito para navegadores, onde a Inteligência Artificial narra a história e você toma as decisões. O projeto foca em uma interface imersiva desenvolvida puramente com React e CSS, sem frameworks visuais.

🔗 **[Clique aqui para jogar](https://mateus-henrique17.github.io/rpg-master)**

---

## 🕹️ O Jogo

Em **RPG Master**, você entra em um universo clássico de fantasia medieval. A cada turno, a API da Groq gera um cenário e apresenta opções fechadas de ação.

O grande diferencial técnico é a conveniência: a aplicação salva cada passo seu em tempo real. Se você fechar a aba no meio de uma masmorra, basta reabrir a página para continuar exatamente de onde parou.

---

## 🛠️ Tecnologias e Recursos

- **React.js** — Estrutura e gerenciamento de estado dos turnos.
- **Groq API** — Motor narrativo acessado pelo endpoint compatível com chat completions.
- **LocalStorage** — Sistema de salvamento automático em segundo plano.
- **Persistência automática**: Sem botões de "Salvar". O progresso é registrado a cada nova escolha feita.

## ⚙️ Configuração local

1. Crie uma chave de API no [console da Groq](https://console.groq.com/keys).
2. Copie `.env.example` para `.env` e preencha `VITE_GROQ_API_KEY`.
3. Opcionalmente, altere `VITE_GROQ_MODEL` para um modelo disponível e habilitado na sua conta Groq. O padrão é `openai/gpt-oss-120b`.
4. Instale as dependências com `npm install` e inicie com `npm run dev`.

Se a API retornar `404` informando que o modelo não existe ou que a conta não tem acesso, confira se o ID de `VITE_GROQ_MODEL` está ativo na página Models do Groq Console e reinicie o Vite depois de editar `.env`.

**Segurança:** esta aplicação é estática e chama a Groq diretamente do navegador. Variáveis `VITE_*` e a chave configurada ficam visíveis para quem acessar o site. Use a chamada direta apenas para desenvolvimento/testes com uma chave restrita; para publicar, mova a chamada para um backend ou função serverless e mantenha a chave no servidor. GitHub Pages, sozinho, não consegue ocultar essa chave.

---

## 👤 Desenvolvedor

- **Mateus Henrique** — [GitHub](https://github.com/Mateus-henrique17) / [LinkedIn](https://www.linkedin.com/in/mateus-henrique-83b164375)
