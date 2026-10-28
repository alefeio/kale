# KALE

Site do casamento de Karen e Alexandre.

14 de novembro de 2026
Belém - PA

A interface homologada continua igual. Confirmações de presença, reservas de presentes e mensagens aos noivos agora ficam no PostgreSQL, via Prisma 7.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 7, com o client gerado em `src/generated/prisma`
- PostgreSQL, acessado em runtime por `@prisma/adapter-pg`
- Zod
- Lucide React
- `next/font` (Cormorant Garamond, Manrope, Parisienne)
- `next/image`

## Arquitetura

```text
Componente
  ↓
Serviço (src/services)
  ↓
Route Handler (src/app/api)
  ↓
Prisma Client (src/lib/db/prisma.ts)
  ↓
PostgreSQL
```

Os componentes não importam o Prisma. O client usa um singleton no desenvolvimento para o hot reload não abrir várias conexões.

O client gerado não é versionado. `postinstall` e `build` executam `prisma generate`, então o deploy não depende de uma cópia antiga.

## Instalação

Na pasta `wedding-app`:

```bash
npm install
```

O `postinstall` gera o Prisma Client. Para isso, uma variável de conexão direta precisa existir no ambiente, sem que o valor seja commitado.

## Desenvolvimento

```bash
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000).

Antes da primeira execução local:

```bash
npm run db:migrate
```

Para carregar os presentes e, só no ambiente local, os convites de demonstração:

```bash
# PowerShell
$env:SEED_DEMO_DATA = "true"
npm run db:seed
```

```bash
# bash
SEED_DEMO_DATA=true npm run db:seed
```

Em produção, `SEED_DEMO_DATA` permanece `false`. O seed grava os 18 presentes reais do chá de panela e é idempotente. Os convites `demo-individual`, `demo-casal` e `demo-familia` só são criados quando a flag está exatamente em `true`, e uma segunda execução não os duplica. A preparação do banco real não usa essa flag.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:generate
npm run db:migrate
npm run db:migrate:deploy
npm run db:seed
npm run db:studio
```

`db:migrate` é o Prisma Migrate de desenvolvimento. `db:migrate:deploy` aplica migrations já existentes e é o comando adequado para um deploy. O build da Vercel não executa migrations.

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Estrutura

```text
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
prisma.config.ts
src/
├── app/
│   ├── api/                convite, RSVP, presentes e mensagens
│   └── convite/[token]/    página privada do convite
├── components/
├── config/wedding.ts
├── generated/prisma/       client gerado, fora do git
├── lib/db/                 conexão, client e mapeamentos
└── services/               implementação usada pela interface
```

## Banco

A URL não fica no `schema.prisma`. O Prisma 7 lê a conexão em `prisma.config.ts`.

O CLI e as migrations usam a primeira variável preenchida, nesta ordem:

```text
DIRECT_URL
DATABASE_URL
POSTGRES_URL
PRISMA_DATABASE_URL
```

O runtime prefere `DATABASE_URL_POOLED`. Enquanto ela não existir, a aplicação usa, nesta ordem:

```text
DATABASE_URL
POSTGRES_URL
PRISMA_DATABASE_URL
DIRECT_URL
```

Não assuma que a URL direta e a URL pooled são iguais. A conexão direta serve para migrations. A pooled serve para o serverless. Antes de tráfego real, `DATABASE_URL_POOLED` precisa ser criada com a connection string pooled do Prisma Postgres. Não substitua as variáveis que a integração da Vercel já gerencia.

Production e Preview não devem compartilhar o mesmo banco quando migrations passarem a nascer em branches. Esta sprint não altera a infraestrutura da Vercel.

Models:

- `Invitation`
- `Guest`
- `RsvpResponse`
- `Gift`
- `GiftReservation`
- `Message`

O status do RSVP (`pending`, `confirmed`, `declined`) é calculado pelos convidados. O status do presente (`available`, `reserved`) é calculado pela existência de uma reserva. `giftId` é único: só pode haver uma reserva ativa por presente.

## Privacidade do RSVP

O convite só é acessado por `/convite/[token]`. A página envia `noindex,nofollow`. O token não entra em sitemap, Open Graph, analytics nem em mensagens de erro.

Não há busca por nome e não há listagem pública de convidados, reservas ou mensagens. A API de um convite devolve somente aquele convite. Nome, contato e mensagem de quem reservou um presente ficam no banco e não voltam na lista pública.

Convites reais futuros devem usar token imprevisível, por `src/lib/invitation-token.ts`. Os três códigos `demo-*` existem apenas para homologação.

## Assets

| Arquivo | Estado |
| --- | --- |
| `public/images/casal-hero.jpg` | Fotografia do casal usada no hero |
| `public/images/casal-final.jpg` | Segunda foto, no encerramento. Enquanto não existir, a seção usa o fechamento tipográfico |
| `public/images/og-casamento.jpg` | 1200×630. Recorte central da foto do casal; pode ser substituído por um cartão desenhado |
| `public/images/gifts/` | Sem fotos dos presentes; os cards usam um desenho próprio |

O enquadramento do hero está em `weddingConfig.heroImage`: desktop e tablet em `center center`, celular em `50% center`.

## Configuração

Tudo que é dado do casamento fica em `src/config/wedding.ts`: nomes, data, local, versículo, PIX e fotografia.

A chave PIX ainda é o marcador `CHAVE_PIX_A_DEFINIR` em `src/config/wedding.ts`. Enquanto estiver assim, o site mostra “Chave PIX a definir”, não copia esse texto e o QR permanece demonstrativo. As variáveis `PIX_KEY`, `PIX_RECEIVER_NAME` e `PIX_RECEIVER_CITY` estão apenas preparadas no `.env.example`. O site ainda não lê esses valores. Não há tabela de contribuição.

## Variáveis de ambiente

O modelo versionado é `.env.example`. Não commite `.env`, `.env.local` nem `.env.production`.

O Prisma CLI carrega primeiro `.env.local` e depois `.env`, sem sobrescrever o que já foi definido.

Cadastre os valores em:

```text
Vercel
→ Project
→ Settings
→ Environment Variables
```

Para a produção, configure pelo menos:

```text
NEXT_PUBLIC_SITE_URL=https://kaeale.vercel.app
DATABASE_URL_POOLED
```

E uma conexão direta para migrations, se ela ainda não tiver sido criada pela integração:

```text
DIRECT_URL
```

`NEXT_PUBLIC_SITE_URL` deve ser `https://kaeale.vercel.app`. Sem ela, o Open Graph publicado aponta para `http://localhost:3000/images/og-casamento.jpg`. Com ela, a imagem passa a ser `https://kaeale.vercel.app/images/og-casamento.jpg`. Se o casamento ganhar um domínio próprio, atualize a variável e publique de novo.

`DATABASE_URL`, `POSTGRES_URL` e `PRISMA_DATABASE_URL` podem ser preenchidas pela integração Prisma Postgres/Vercel. Não as substitua no painel.

`AUTH_SECRET` e `ADMIN_EMAIL` ficam reservados. A autenticação ainda não existe.

## Sprint atual

O banco local está preparado para dados reais. A lista do chá de panela tem 18 presentes, sem fotos e sem reservas. Convites de demonstração não fazem parte desse banco.

## Pendências

- Separar os bancos de Production e Preview quando as migrations passarem a ser desenvolvidas em branches
- Chave PIX real. O payload BR Code já está preparado; a imagem do QR segue demonstrativa
- Fotografias dos 18 presentes. Enquanto não existirem, os cards usam o desenho já existente
- `public/images/casal-final.jpg`, se quiserem fechar o site com outra foto do casal
- Cartão de Open Graph desenhado, se quiserem substituir o recorte de 1200×630
- Confirmar `NEXT_PUBLIC_SITE_URL=https://kaeale.vercel.app` no painel da Vercel e trocar se houver domínio próprio
- Convites reais, com tokens imprevisíveis

## Próximo módulo — Admin

- autenticação
- convidados
- convites
- RSVP
- presentes
- reservas
- mensagens

Na Sprint 3, a reserva de presente continua exigindo `donorName`. O contato ou WhatsApp passará a ser obrigatório, e uma reserva poderá ser associada a um convite válido. Essa associação ainda não existe.

