const siteConfig = {
  // ── Supabase ──────────────────────────────────────────────────────────────
  // Preencha com os valores do painel Supabase: Settings > API
  supabase: {
    url: "https://SEU_PROJETO.supabase.co",
    anonKey: "SUA_CHAVE_ANONIMA_AQUI"
  },
  siteName: "Leandro Momente",
  whatsappNumber: "5511999999999",
  phoneDisplay: "(11) 99999-9999",
  whatsappMessage: "Olá! Gostaria de conversar sobre consultoria e capacitação.",
  email: "contato@leandromomente.com.br",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  address: "Rua das Oficinas, 123 - Vila Mariana, São Paulo - SP",
  mapEmbedUrl: "https://www.google.com/maps?q=Rua%20das%20Oficinas%20123%20S%C3%A3o%20Paulo&output=embed",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Rua%20das%20Oficinas%20123%20S%C3%A3o%20Paulo",
  openingHours: "Atendimento por agendamento",
  legal: {
    privacyPolicyUrl: "#",
    termsUrl: "#"
  },
  hero: {
    eyebrow: "Consultoria e Capacitação",
    title: "Conhecimento técnico em direitos humanos para quem atua na ponta",
    subtitle:
      "Consultoria e formação para profissionais e instituições da rede de atendimento à criança e ao adolescente, à mulher, à pessoa idosa e à pessoa com deficiência.",
    primaryCta: "Solicitar proposta",
    secondaryCta: "Ver capacitações"
  },
  sections: {
    about: {
      title: "Autoridade profissional ao lado da rede de atendimento",
      paragraphs: [
        "Leandro Momente atua na construção de respostas técnicas, humanas e aplicáveis para profissionais que trabalham em contextos sensíveis de proteção e direitos.",
        "A proposta é traduzir a legislação e as diretrizes setoriais em orientações concretas para o cotidiano da rede, sem perder o rigor técnico nem a clareza necessária.",
        "O trabalho é voltado a conselheiros tutelares, equipes de atendimento, gestores públicos, organizações da sociedade civil e profissionais de saúde, educação, assistência social e justiça."
      ]
    }
  }
};

window.siteConfig = siteConfig;
