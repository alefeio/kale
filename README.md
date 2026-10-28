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
| `public/images/og-casamento.jpg` | Recorte da mesma foto para Open Graph |
| `public/images/gifts/` | Sem fotos dos presentes; os cards usam um desenho próprio |

O enquadramento do hero está em `weddingConfig.heroImage`: desktop e tablet em `center center`, celular em `50% center`.

## Configuração

Tudo que é dado do casamento fica em `src/config/wedding.ts`: nomes, data, local, versículo, PIX e fotografia.

A chave PIX ainda é o marcador `CHAVE_PIX_A_DEFINIR`. Enquanto estiver assim, o site mostra “Chave PIX a definir” e não copia esse texto.

Para o Open Graph em produção, defina a URL pública:

```bash
NEXT_PUBLIC_SITE_URL=https://seu-dominio
```

Não commite `.env` nem `.env.local`.

## Sprint atual

Sprint 1: identidade, homepage, hero, contagem, evento, RSVP mockado, presentes, PIX demonstrativo, mensagem, FAQ e responsividade.

## Pendências

- Chave PIX real e QR Code correspondente
- Fotografias individuais dos presentes
- Cartão de Open Graph desenhado, se quiserem substituir o recorte da foto
- `NEXT_PUBLIC_SITE_URL` no ambiente de produção

## Próximas etapas

A Sprint 2 começa depois da homologação desta interface. Banco, painel, autenticação e PIX com confirmação ficam para depois. Não fazem parte desta versão.
