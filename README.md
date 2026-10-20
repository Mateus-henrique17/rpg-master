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

## ⚙️ Configuração e deploy no GitHub Pages

1. Crie uma chave de API no [console da Groq](https://console.groq.com/keys).
2. Copie `.env.example` para `.env` e configure `VITE_GROQ_API_KEY` com uma chave nova. Não reutilize uma chave que já tenha sido compartilhada.
3. Opcionalmente, altere `VITE_GROQ_MODEL` para um modelo disponível na sua conta. O padrão é `openai/gpt-oss-120b`.
4. Instale as dependências com `npm install` e inicie com `npm run dev`.

Para publicar no GitHub Pages usando `npm run deploy`, a variável `VITE_GROQ_API_KEY` precisa estar configurada antes do build. O valor é incorporado ao JavaScript que será público.

**Limitação importante:** este app estático chama a Groq diretamente do navegador. Não há rate limit por IP controlado pelo app e não é possível esconder a chave de quem acessar o site. A Groq ainda aplica suas próprias cotas/limites à chave, e a interface exibe o tempo de espera quando a resposta informa um limite; isso não substitui proteção de backend. Use uma chave dedicada, com limites de gasto/uso quando disponíveis, monitore-a e revogue-a se for exposta. Não use esta configuração para uma chave com acesso sensível.

Se a chave já foi incluída em um build publicado, revogue-a e gere outra. Se o modelo não existir ou a conta não tiver acesso, confira o ID de `VITE_GROQ_MODEL`, depois reinicie o Vite e gere um novo deploy.

---

## 👤 Desenvolvedor

- **Mateus Henrique** — [GitHub](https://github.com/Mateus-henrique17) / [LinkedIn](https://www.linkedin.com/in/mateus-henrique-83b164375)
