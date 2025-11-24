import type { Metadata } from 'next';

/**
 * Configuração base de metadata para o aplicativo
 */
const baseMetadata = {
  applicationName: 'DuduFisio-AI',
  authors: [{ name: 'DuduFisio-AI' }],
  keywords: [
    'fisioterapia',
    'gestão clínica',
    'prontuário eletrônico',
    'agendamentos',
    'IA',
    'saúde',
    'fisioterapia digital',
  ],
  creator: 'DuduFisio-AI',
  publisher: 'DuduFisio-AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: (() => {
    const url = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'https://app.dudufisio.com.br';
    // Garantir que a URL tenha protocolo
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
    return new URL(urlWithProtocol);
  })(),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'DuduFisio-AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DuduFisio-AI - Sistema de Gestão de Clínica de Fisioterapia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@dudufisio',
    site: '@dudufisio',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Adicionar códigos de verificação se necessário
    // google: 'seu-codigo-google',
    // yandex: 'seu-codigo-yandex',
    // bing: 'seu-codigo-bing',
  },
  // Resource hints e outras meta tags
  other: {
    'theme-color': '#3b82f6',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'mobile-web-app-capable': 'yes',
  },
};

export interface MetadataOptions {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
  noFollow?: boolean;
}

/**
 * Gera metadata completa para uma página
 */
export function generatePageMetadata(options: MetadataOptions): Metadata {
  const {
    title,
    description,
    path,
    keywords = [],
    ogImage = '/og-image.png',
    ogType = 'website',
    noIndex = false,
    noFollow = false,
  } = options;

  const fullTitle = `${title} | DuduFisio-AI`;
  const fullDescription = description || 'Sistema completo de gestão para clínicas de fisioterapia';
  const canonical = path ? `${baseMetadata.metadataBase}${path}` : baseMetadata.metadataBase.href;

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: [...baseMetadata.keywords, ...keywords],
    alternates: {
      canonical,
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: fullTitle,
      description: fullDescription,
      url: canonical,
      type: ogType,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      ...baseMetadata.twitter,
      title: fullTitle,
      description: fullDescription,
      images: [ogImage],
    },
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        'max-video-preview': -1,
        'max-image-preview': 'large' as 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Metadata para páginas do dashboard
 */
export function generateDashboardMetadata(
  section: string,
  description?: string
): Metadata {
  const sectionNames: Record<string, string> = {
    pacientes: 'Pacientes',
    agenda: 'Agenda',
    tratamentos: 'Tratamentos',
    financeiro: 'Financeiro',
    biblioteca: 'Biblioteca',
    relatorios: 'Relatórios',
    marketing: 'Marketing',
  };

  const sectionName = sectionNames[section] || section;
  const defaultDescription: Record<string, string> = {
    pacientes: 'Gerencie todos os pacientes da clínica, prontuários e informações',
    agenda: 'Agende e gerencie consultas e sessões de fisioterapia',
    tratamentos: 'Gerencie tratamentos, evoluções e prescrições de exercícios',
    financeiro: 'Controle financeiro, pagamentos e transações da clínica',
    biblioteca: 'Biblioteca de exercícios e materiais clínicos',
    relatorios: 'Relatórios e análises clínicas e financeiras',
    marketing: 'Gestão de marketing e pacientes inativos',
  };

  return generatePageMetadata({
    title: sectionName,
    description: description || defaultDescription[section] || `Gerencie ${sectionName.toLowerCase()}`,
    path: `/dashboard/${section}`,
    keywords: [sectionName.toLowerCase(), 'dashboard', 'gestão'],
  });
}

/**
 * Metadata para páginas de detalhes (ex: paciente por ID)
 */
export function generateDetailMetadata(
  type: 'paciente' | 'tratamento' | 'agendamento',
  name: string,
  id: string,
  description?: string
): Metadata {
  const typeNames = {
    paciente: 'Paciente',
    tratamento: 'Tratamento',
    agendamento: 'Agendamento',
  };

  const typeName = typeNames[type];
  const defaultDescription: Record<string, string> = {
    paciente: `Detalhes do paciente ${name}`,
    tratamento: `Detalhes do tratamento de ${name}`,
    agendamento: `Detalhes do agendamento`,
  };

  return generatePageMetadata({
    title: `${typeName}: ${name}`,
    description: description || defaultDescription[type],
    path: `/dashboard/${type === 'paciente' ? 'pacientes' : type === 'tratamento' ? 'tratamentos' : 'agenda'}/${id}`,
    keywords: [type, name, 'detalhes'],
    ogType: 'article',
    noIndex: true, // Detalhes geralmente não devem ser indexados
  });
}

/**
 * Metadata base exportada para uso no layout
 */
export const basePageMetadata: Metadata = {
  ...baseMetadata,
  title: {
    default: 'DuduFisio-AI - Sistema de Gestão de Clínica de Fisioterapia',
    template: '%s | DuduFisio-AI',
  },
  description: 'Sistema completo de gestão para clínicas de fisioterapia com IA integrada, agendamentos, prontuários eletrônicos e muito mais.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

