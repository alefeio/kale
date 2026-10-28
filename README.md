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

A chave PIX ainda é o marcador `CHAVE_PIX_A_DEFINIR`. Enquanto estiver assim, o site mostra “Chave PIX a definir”, não copia esse texto e o QR permanece demonstrativo. Quando a chave real entrar em `weddingConfig.pix.key`, o QR passa a receber um BR Code (`src/lib/pix-brcode.ts`), não o texto cru da chave. O desenho do QR continua ilustrativo até haver um gerador de imagem.

Em produção, a URL pública precisa estar definida para o Open Graph:

```bash
NEXT_PUBLIC_SITE_URL=https://kaeale.vercel.app
```

Se o casamento ganhar um domínio próprio, atualize esse valor. Não commite `.env` nem `.env.local`.

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
