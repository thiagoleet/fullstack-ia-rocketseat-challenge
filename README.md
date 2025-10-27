![Thiago - Capa](https://user-images.githubusercontent.com/9437391/153274659-915c4df9-0032-4757-a9a2-6a85107c276b.png)

# Hello there!

## Who Am I?

- 🇧🇷 I'm from Brazil
- 👨‍💻Software Engineer, currently working with Frontend Development
- 💡 Always learning.
- ⚙️ Contact me on [LinkedIn](https://www.linkedin.com/in/thiagofmleite/)
- 🚶‍♂️Follow me on [Twitter](https://twitter.com/thiagoleite), [Instagram](https://instagram.com/thiagoleet) and [Twitch](https://twitch.tv/thiagoleet).

# Fullstack IA Rocketseat Challenge

Um sistema completo de inspeção de webhooks construído com React e Node.js.

## 🚀 Tecnologias

### Backend (API)

- **Node.js** com **TypeScript**
- **Fastify** - Framework web rápido e eficiente
- **PostgreSQL** - Banco de dados relacional
- **Drizzle ORM** - ORM type-safe para TypeScript
- **Zod** - Validação de esquemas
- **Docker** - Containerização do banco de dados

### Frontend (Web)

- **React 19** com **TypeScript**
- **Vite** - Build tool e dev server
- **CSS** - Estilização

## 📦 Instalação

### Pré-requisitos

- Node.js (versão 18 ou superior)
- pnpm (gerenciador de pacotes)
- Docker (para o banco de dados)

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd fullstack-ia-rocketseat-challenge
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure o banco de dados

```bash
# Inicie o PostgreSQL via Docker
cd api
docker-compose up -d

# Execute as migrações
pnpm db:migrate
```

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env` na pasta `api` com:

```env
DATABASE_URL="postgresql://docker:docker@localhost:5432/webhooks"
PORT=3333
```

## 🏃‍♂️ Como usar

### Executar em desenvolvimento

#### Backend (API)

```bash
cd api
pnpm dev
```

A API estará disponível em `http://localhost:3333`

#### Frontend (Web)

```bash
cd web
pnpm dev
```

O frontend estará disponível em `http://localhost:5173`

### Executar ambos simultaneamente

Na raiz do projeto:

```bash
pnpm dev
```

## 🎯 Funcionalidades

- **Webhook Inspector API**: Captura e inspeciona requisições de webhook
- **Interface Web**: Visualização e gerenciamento dos webhooks recebidos
- **Documentação Swagger**: API documentada automaticamente em `/docs`
- **Banco de dados**: Persistência de dados dos webhooks

## 🛠️ Scripts disponíveis

### API

- `pnpm dev` - Executa o servidor em modo desenvolvimento
- `pnpm build` - Compila o projeto
- `pnpm start` - Executa o servidor em produção
- `pnpm db:generate` - Gera migrações do banco
- `pnpm db:migrate` - Executa migrações
- `pnpm db:studio` - Abre o Drizzle Studio

### Web

- `pnpm dev` - Executa o frontend em desenvolvimento
- `pnpm build` - Compila o projeto para produção
- `pnpm preview` - Visualiza a build de produção

## 🔗 Endpoints da API

- `GET /api/webhooks` - Lista todos os webhooks capturados
- `GET /docs` - Documentação Swagger da API

## 📁 Estrutura do projeto

```
├── api/                    # Backend Node.js
│   ├── src/
│   │   ├── db/            # Configuração do banco e schemas
│   │   ├── routes/        # Rotas da API
│   │   └── server.ts      # Servidor principal
│   └── docker-compose.yml # Configuração do PostgreSQL
├── web/                   # Frontend React
│   └── src/
│       ├── components/    # Componentes React
│       └── assets/        # Recursos estáticos
└── package.json          # Configuração do workspace
```

---
