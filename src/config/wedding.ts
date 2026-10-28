export const weddingConfig = {
  couple: {
    bride: "Karen",
    groom: "Alexandre",
    displayName: "Karen & Alexandre",
    monogram: "K&A",
  },

  ceremony: {
    date: "2026-11-14",
    time: "19:00",
    isoDate: "2026-11-14T19:00:00-03:00",
    type: "Cerimônia religiosa",
    dateLabel: "14 de novembro de 2026",
    timeLabel: "19h",
    dottedDate: "14 • 11 • 2026",
    numericDate: "14.11.2026",
    calendarDuration: "PT2H",
  },

  venue: {
    name: "Maison Rose Eventos",
    address: "Passagem Serrao de Castro, nº 272",
    neighborhood: "Guamá",
    city: "Belém",
    state: "PA",
  },

  verse: {
    text: "As muitas águas não poderiam apagar este amor, nem os rios afogá-lo.",
    reference: "Cânticos 8:7",
  },

  pix: {
    enabled: true,
    key: "CHAVE_PIX_A_DEFINIR",
    placeholderKey: "CHAVE_PIX_A_DEFINIR",
    receiver: "Karen e Alexandre",
  },

  heroImage: {
    src: "/images/casal-hero.jpg",
    alt: "Karen e Alexandre",
    /**
     * Ponto focal do recorte (object-position).
     * Os rostos ficam no centro da fotografia.
     * Ajuste só estes valores se algum breakpoint cortar os rostos.
     */
    positionDesktop: "center center",
    positionTablet: "center center",
    positionMobile: "50% center",
  },

  navigation: [
    { href: "#nosso-dia", label: "Nosso dia" },
    { href: "#presentes", label: "Presentes" },
    { href: "#presenca", label: "Confirme sua presença" },
    { href: "#local", label: "Local" },
  ],

  copy: {
    faithEyebrow: "✦",
    faithTitle: "Pela graça de Deus",
    faithText: "Celebramos o amor, a restauração\ne o início de uma nova família.",
    countdownLabel: "Faltam",
    countdownFinished: "O nosso grande dia chegou. ❤️",
    scrollHint: "Role para conhecer o nosso grande dia",
    eventTitle: "O nosso grande dia",
    viewMap: "Ver localização",
    addToCalendar: "Adicionar à agenda",
    rsvpTitle: "Você estará conosco?",
    rsvpText:
      "Será uma alegria dividir este momento\ncom pessoas especiais da nossa história.",
    rsvpCodeHint: "Tenha em mãos o código recebido no seu convite.",
    rsvpButton: "Confirmar minha presença",
    rsvpModalTitle: "Digite o código recebido no seu convite",
    rsvpCodeLabel: "Código do convite",
    rsvpContinue: "Continuar",
    rsvpCodeError: "Não encontramos um convite válido com este código.",
    giftsTitle: "Chá de Panela",
    giftsText:
      "Mais importante que qualquer presente será ter\nvocês fazendo parte deste novo capítulo conosco.\n\nMas, para quem desejar nos presentear,\npreparamos algumas sugestões com carinho.",
    pixTitle: "Prefere nos presentear de outra forma?",
    pixText:
      "Se desejar, você também pode contribuir através do PIX.\nTodo carinho será recebido com muita gratidão.",
    pixPendingLabel: "Chave PIX a definir",
    pixPendingNote: "A chave ainda será definida. A cópia fica disponível quando ela for informada.",
    pixCopy: "Copiar chave PIX",
    pixCopied: "Chave copiada ✓",
    messageTitle: "Deixe uma mensagem para nós",
    messageText:
      "Quer deixar algumas palavras para este novo capítulo?\nVamos guardar cada mensagem com carinho.",
    messageName: "Seu nome",
    messageBody: "Sua mensagem",
    messageSubmit: "Enviar mensagem",
    messageSuccessTitle: "Mensagem recebida ❤️",
    messageSuccessText: "Vamos guardar suas palavras com carinho.",
    finalBlessing: "Que o nosso amor seja sempre conduzido\npela graça de Deus.",
    faqTitle: "Antes do grande dia",
    faqIntro: "Algumas informações que podem ajudar.",
    footerNote: "Feito com amor para o nosso grande dia.",
    invitationGreeting: "Será uma alegria celebrar este momento com vocês.",
    invitationQuestion: "Quem estará conosco?",
    invitationNote: "Existe alguma informação que gostaria de nos deixar?",
    invitationConfirm: "Confirmar presença",
    invitationDecline: "Não poderemos comparecer",
    invitationConfirmedTitle: "Presença confirmada ❤️",
    invitationConfirmedText: "Estamos muito felizes por ter vocês conosco.",
    invitationDeclinedTitle: "Sentiremos sua falta, mas agradecemos muito pelo carinho.",
    invitationDeclinedText: "",
    invitationEdit: "Alterar confirmação",
    invitationInvalidTitle: "Não encontramos este convite.",
    invitationInvalidText: "Confira o link enviado junto ao seu convite.",
    giftReserveTitle: "Que carinho! ❤️",
    giftReserveText: "Deseja reservar este presente para Karen e Alexandre?",
    giftReserveAction: "Reservar presente",
    giftReserveCancel: "Cancelar",
    giftReserved: "Presente reservado",
    giftWant: "Quero dar este presente",
    giftReservedStatus: "Reservado",
    giftAvailableStatus: "Disponível",
  },

  faq: [
    {
      question: "Onde será a cerimônia?",
      answer: "Maison Rose Eventos, no bairro do Guamá, em Belém.",
    },
    {
      question: "Qual é o horário?",
      answer: "A cerimônia religiosa terá início às 19h.",
    },
    {
      question: "Como confirmo minha presença?",
      answer:
        "Utilize o código ou o link individual enviado junto ao seu convite.",
    },
    {
      question: "Posso confirmar outras pessoas?",
      answer: "Seu convite mostrará somente as pessoas vinculadas a ele.",
    },
  ],

  metadata: {
    title: "Karen & Alexandre — 14.11.2026",
    description:
      "Nosso grande dia está chegando. Confira os detalhes da cerimônia, confirme sua presença e conheça nossa lista de presentes.",
    ogImage: "/images/og-casamento.jpg",
  },
} as const

export type WeddingConfig = typeof weddingConfig
