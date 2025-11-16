import React from 'react';

interface MetadataProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  robots?: string;
  viewport?: string;
  themeColor?: string;
  manifest?: string;
  favicon?: string;
  appleTouchIcon?: string;
}

/**
 * React 19 Metadata Component
 * 
 * Este componente utiliza a nova funcionalidade de metadata nativa do React 19
 * para definir meta tags, Open Graph, Twitter Cards e outras informações de SEO
 * sem necessidade de bibliotecas externas como react-helmet.
 */
export function React19Metadata({
  title = 'DuduFisio-AI - Sistema de Gestão para Fisioterapia',
  description = 'Sistema completo de gestão para clínicas de fisioterapia com IA integrada, agendamentos, prontuários eletrônicos e muito mais.',
  keywords = 'fisioterapia, gestão clínica, prontuário eletrônico, agendamentos, IA, saúde',
  author = 'DuduFisio-AI',
  ogTitle,
  ogDescription,
  ogImage = '/og-image.png',
  ogUrl,
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  canonical,
  robots = 'index, follow',
  viewport = 'width=device-width, initial-scale=1',
  themeColor = '#3b82f6',
  manifest = '/manifest.json',
  favicon = '/favicon.ico',
  appleTouchIcon = '/apple-touch-icon.png'
}: MetadataProps) {
  return (
    <>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={robots} />
      <meta name="viewport" content={viewport} />
      <meta name="theme-color" content={themeColor} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Favicon and Icons */}
      <link rel="icon" href={favicon} />
      <link rel="apple-touch-icon" href={appleTouchIcon} />
      <link rel="manifest" href={manifest} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage} />
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      <meta property="og:site_name" content="DuduFisio-AI" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle || ogTitle || title} />
      <meta name="twitter:description" content={twitterDescription || ogDescription || description} />
      <meta name="twitter:image" content={twitterImage || ogImage} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="application-name" content="DuduFisio-AI" />
      <meta name="apple-mobile-web-app-title" content="DuduFisio-AI" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-TileColor" content={themeColor} />
      <meta name="msapplication-tap-highlight" content="no" />
      
      {/* Structured Data for Healthcare */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "DuduFisio-AI",
            "description": description,
            "applicationCategory": "HealthApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "BRL"
            },
            "provider": {
              "@type": "Organization",
              "name": "DuduFisio-AI",
              "url": "https://dudufisio-ai.com"
            }
          })
        }}
      />
    </>
  );
}

/**
 * Hook para usar metadata dinâmica em componentes
 */
export function useMetadata() {
  const setMetadata = (metadata: Partial<MetadataProps>) => {
    // Em React 19, podemos usar document.title e outras APIs nativas
    if (metadata.title) {
      document.title = metadata.title;
    }
    
    if (metadata.description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', metadata.description);
      }
    }
    
    // Atualizar Open Graph dinamicamente
    if (metadata.ogTitle) {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', metadata.ogTitle);
      }
    }
    
    if (metadata.ogDescription) {
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', metadata.ogDescription);
      }
    }
  };
  
  return { setMetadata };
}

/**
 * Componente para metadata específica de páginas
 */
export function PageMetadata({ 
  pageTitle, 
  pageDescription, 
  patientName 
}: { 
  pageTitle: string; 
  pageDescription?: string; 
  patientName?: string; 
}) {
  const title = patientName ? `${pageTitle} - ${patientName}` : pageTitle;
  const description = pageDescription || `Página ${pageTitle} do sistema DuduFisio-AI`;
  
  return (
    <React19Metadata
      title={title}
      description={description}
      ogTitle={title}
      ogDescription={description}
    />
  );
}

/**
 * Componente para metadata de prontuários (LGPD compliant)
 */
export function MedicalRecordMetadata({ 
  patientName, 
  recordType = 'Prontuário' 
}: { 
  patientName: string; 
  recordType?: string; 
}) {
  return (
    <React19Metadata
      title={`${recordType} - ${patientName}`}
      description={`Prontuário médico de ${patientName} - Sistema DuduFisio-AI`}
      robots="noindex, nofollow" // Não indexar prontuários por questões de privacidade
    />
  );
}
