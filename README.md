# KALE

Site do casamento de Karen e Alexandre.

14 de novembro de 2026
Belém - PA

Experiência editorial do convite: cerimônia, confirmação de presença por código e lista do chá de panela. Esta versão é a Sprint 1, pronta para homologação visual. Não há banco de dados.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React
- `next/font` (Cormorant Garamond, Manrope, Parisienne)
- `next/image`

## Instalação

Na pasta do projeto:

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000).

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
src/
├── app/                  páginas (home e /convite/[token])
├── components/
│   ├── invitation/       fluxo privado de RSVP
│   └── wedding/          seções públicas
├── config/wedding.ts     data, local, textos e foto
├── data/                 sementes dos mocks
├── services/             interface usada pela interface
│   ├── gifts/
│   └── rsvp/
├── lib/                  mapa, agenda e armazenamento local
└── types/
```

A interface fala com o serviço. O serviço, nesta sprint, fala com o mock. Na Sprint 2 o mock pode ser trocado por banco sem reescrever as seções.

## Mocks

Convites de demonstração, sem busca pública por nome:

- `/convite/demo-individual`
- `/convite/demo-casal`
- `/convite/demo-familia`

Um código inválido mostra apenas que o convite não foi encontrado.

Reservas de presentes, respostas de presença e mensagens aos noivos ficam no `localStorage` do navegador. As mensagens não são listadas no site. A reserva não mostra quem reservou.

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

A chave PIX ainda é o marcador `CHAVE_PIX_A_DEFINIR` em `src/config/wedding.ts`. Enquanto estiver assim, o site mostra “Chave PIX a definir”, não copia esse texto e o QR permanece demonstrativo. As variáveis `PIX_KEY`, `PIX_RECEIVER_NAME` e `PIX_RECEIVER_CITY` estão apenas preparadas no `.env.example`. O site ainda não lê esses valores.

## Variáveis de ambiente

O modelo versionado é `.env.example`. Não commite `.env`, `.env.local` nem `.env.production`.

Cadastre os valores em:

```text
Vercel
→ Project
→ Settings
→ Environment Variables
```

Para a produção, configure pelo menos estas quando o banco existir:

```text
NEXT_PUBLIC_SITE_URL
DATABASE_URL
DIRECT_URL
```

`NEXT_PUBLIC_SITE_URL` deve ser `https://kaeale.vercel.app`. Sem ela, o Open Graph publicado aponta para `http://localhost:3000/images/og-casamento.jpg`. Com ela, a imagem passa a ser `https://kaeale.vercel.app/images/og-casamento.jpg`. Se o casamento ganhar um domínio próprio, atualize a variável e publique de novo.

`DATABASE_URL` é a conexão que a aplicação usa em runtime, pelo Prisma. Na Vercel, use a connection string adequada a serverless. Se o Postgres oferecer uma URL pooled, ela entra aqui.

`DIRECT_URL` é a conexão direta, usada pelo Prisma Migrate e por operações administrativas. Se o provedor separar pooled e direct/non-pooled, a URL direta entra aqui. Não assuma que as duas são iguais.

Na Sprint 2, o datasource do Prisma deve ficar compatível com:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

`AUTH_SECRET` e `ADMIN_EMAIL` ficam reservados. A autenticação ainda não existe.

## Sprint atual

Sprint 1.1: refinamento visual do hero, da navegação, dos presentes e do encerramento. Ainda sem banco de dados.

## Pendências

- Chave PIX real. O payload BR Code já está preparado; a imagem do QR segue demonstrativa
- Fotografias individuais dos presentes
- `public/images/casal-final.jpg`, se quiserem fechar o site com outra foto do casal
- Cartão de Open Graph desenhado, se quiserem substituir o recorte de 1200×630
- Confirmar `NEXT_PUBLIC_SITE_URL=https://kaeale.vercel.app` no painel da Vercel e trocar se houver domínio próprio

## Próximas etapas

A Sprint 2 começa depois da homologação desta interface. Banco, painel, autenticação e PIX com confirmação ficam para depois. Não fazem parte desta versão.
