# ⚔️ RPG Master

Uma aventura medieval interativa para navegador. A inteligência artificial assume o papel de Mestre, descreve cada cena e oferece possibilidades; você decide como seu personagem reage.

**[Jogue RPG Master](https://mateus-henrique17.github.io/rpg-master)**

## Como jogar

1. Aguarde o Mestre apresentar a cena e as opções disponíveis.
2. Escolha uma das ações sugeridas ou escreva uma ação própria.
3. Acompanhe a consequência e continue a aventura. O progresso é salvo automaticamente neste navegador.

Use **Novo jogo** para apagar o histórico salvo e começar outra aventura. O salvamento usa o `localStorage` do navegador; limpar os dados do site também remove o progresso.

## Recursos

- Narrativas e respostas geradas pela API da Groq.
- Opções de ação rápida e campo para ações personalizadas.
- Histórico persistido localmente para retomar a aventura.
- Interface responsiva, com indicador de carregamento, tratamento de erros e espera após limite de requisições.

## Tecnologias

- [React](https://react.dev/) 19
- [Vite](https://vite.dev/) 8
- [Groq API](https://console.groq.com/docs/quickstart)
- CSS, sem framework visual

## Desenvolvimento local

Requisitos: Node.js e npm.

1. Crie uma chave no [console da Groq](https://console.groq.com/keys).
2. Copie `.env.example` para `.env` e defina `VITE_GROQ_API_KEY` com sua chave. O arquivo `.env` é ignorado pelo Git.
3. Opcionalmente, ajuste `VITE_GROQ_MODEL`. O padrão é `openai/gpt-oss-120b`; use um modelo disponível para sua conta.
4. Instale as dependências e inicie o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

O Vite carrega as variáveis de ambiente ao iniciar. Reinicie o servidor depois de alterar o `.env`.

## Scripts

| Comando           | Descrição                                       |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Inicia o servidor local de desenvolvimento.     |
| `npm run lint`    | Verifica o código com ESLint.                   |
| `npm run build`   | Gera a versão de produção na pasta `dist/`.     |
| `npm run preview` | Serve localmente a build de produção.           |
| `npm run deploy`  | Gera a build e publica `dist/` no GitHub Pages. |

## Build e segurança da chave

O Vite **não copia o arquivo `.env` para `dist/`**. Porém, variáveis com prefixo `VITE_` usadas pelo código são substituídas durante a build e ficam visíveis nos arquivos JavaScript públicos. Portanto, a chave `VITE_GROQ_API_KEY` não pode ser mantida secreta em uma aplicação estática publicada no GitHub Pages.

Para testar localmente, use uma chave dedicada, monitore os limites disponíveis na Groq e revogue-a se houver exposição. Não use uma chave com acesso sensível. Para proteger a chave em produção, é necessário mover as chamadas à Groq para um backend ou função serverless e manter o segredo somente no servidor. Se uma chave já foi incluída em uma build publicada, revogue-a e gere outra.

## Publicação no GitHub Pages

Configure `VITE_GROQ_API_KEY` no ambiente que executa a publicação antes de chamar `npm run deploy`. O script executa a build e envia o conteúdo de `dist/` para a branch `gh-pages`; confirme também que o GitHub Pages do repositório está configurado para publicar essa branch.

Se a API retornar erro de autenticação, confira a chave. Se o modelo não estiver disponível, ajuste `VITE_GROQ_MODEL` e faça uma nova build/publicação. A Groq aplica limites próprios; a espera exibida pelo jogo ajuda a lidar com respostas de limite, mas não substitui um backend com controle de uso.

## Autor

**Mateus Henrique** — [GitHub](https://github.com/Mateus-henrique17) · [LinkedIn](https://www.linkedin.com/in/mateus-henrique-83b164375)
