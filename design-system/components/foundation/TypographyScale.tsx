import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../layout/Card';

interface TypographySampleProps {
  variant: string;
  size: string;
  weight: string;
  lineHeight: string;
  sample: string;
  description: string;
}

const TypographySample: React.FC<TypographySampleProps> = ({
  variant,
  size,
  weight,
  lineHeight,
  sample,
  description,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'h1':
        return 'text-6xl font-bold';
      case 'h2':
        return 'text-5xl font-bold';
      case 'h3':
        return 'text-4xl font-bold';
      case 'h4':
        return 'text-3xl font-bold';
      case 'h5':
        return 'text-2xl font-bold';
      case 'h6':
        return 'text-xl font-bold';
      case 'body-large':
        return 'text-lg font-normal';
      case 'body':
        return 'text-base font-normal';
      case 'body-small':
        return 'text-sm font-normal';
      case 'caption':
        return 'text-xs font-normal';
      case 'button':
        return 'text-base font-semibold';
      case 'overline':
        return 'text-xs font-bold uppercase tracking-wider';
      default:
        return 'text-base font-normal';
    }
  };

  return (
    <div className="group relative p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">{variant}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        {copied && (
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-md">
            Copiado!
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <p className={`${getTextStyle()} text-gray-900 dark:text-white`}>
          {sample}
        </p>
      </div>

      <div className="space-y-2 text-xs font-mono text-gray-600 dark:text-gray-400">
        <button
          onClick={() => copyToClipboard(`font-size: ${size};`)}
          className="block w-full text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          font-size: {size};
        </button>
        <button
          onClick={() => copyToClipboard(`font-weight: ${weight};`)}
          className="block w-full text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          font-weight: {weight};
        </button>
        <button
          onClick={() => copyToClipboard(`line-height: ${lineHeight};`)}
          className="block w-full text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          line-height: {lineHeight};
        </button>
      </div>
    </div>
  );
};

export const TypographyScale: React.FC = () => {
  const { themeConfig } = useTheme();

  const typographyVariants = [
    {
      variant: 'h1',
      size: '3.75rem',
      weight: '700',
      lineHeight: '1.2',
      sample: 'The quick brown fox jumps over the lazy dog',
      description: 'Títulos principais e hero sections',
    },
    {
      variant: 'h2',
      size: '3rem',
      weight: '700',
      lineHeight: '1.2',
      sample: 'The quick brown fox jumps over the lazy dog',
      description: 'Títulos de seção principais',
    },
    {
      variant: 'h3',
      size: '2.25rem',
      weight: '700',
      lineHeight: '1.3',
      sample: 'The quick brown fox jumps over the lazy dog',
      description: 'Subtítulos e títulos de cards',
    },
    {
      variant: 'h4',
      size: '1.875rem',
      weight: '700',
      lineHeight: '1.3',
      sample: 'The quick brown fox jumps over the lazy dog',
      description: 'Títulos de conteúdo e widgets',
    },
    {
      variant: 'h5',
      size: '1.5rem',
      weight: '700',
      lineHeight: '1.4',
      sample: 'The quick brown fox jumps over the lazy dog',
      description: 'Títulos pequenos e labels importantes',
    },
    {
      variant: 'h6',
      size: '1.25rem',
      weight: '700',
      lineHeight: '1.4',
      sample: 'The quick brown fox jumps over the lazy dog',
      description: 'Títulos mínimos e destaques',
    },
    {
      variant: 'body-large',
      size: '1.125rem',
      weight: '400',
      lineHeight: '1.6',
      sample: 'The quick brown fox jumps over the lazy dog. Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed.',
      description: 'Texto corporal grande e introduções',
    },
    {
      variant: 'body',
      size: '1rem',
      weight: '400',
      lineHeight: '1.6',
      sample: 'The quick brown fox jumps over the lazy dog. Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed.',
      description: 'Texto corporal padrão e parágrafos',
    },
    {
      variant: 'body-small',
      size: '0.875rem',
      weight: '400',
      lineHeight: '1.5',
      sample: 'The quick brown fox jumps over the lazy dog. Typography is the art and technique of arranging type.',
      description: 'Texto auxiliar e descrições',
    },
    {
      variant: 'caption',
      size: '0.75rem',
      weight: '400',
      lineHeight: '1.4',
      sample: 'The quick brown fox jumps over the lazy dog',
      description: 'Legendas e textos mínimos',
    },
    {
      variant: 'button',
      size: '1rem',
      weight: '600',
      lineHeight: '1.5',
      sample: 'BUTTON TEXT',
      description: 'Texto de botões e ações',
    },
    {
      variant: 'overline',
      size: '0.75rem',
      weight: '700',
      lineHeight: '1.4',
      sample: 'OVERLINE TEXT',
      description: 'Sobretítulos e categorias',
    },
  ];

  const fontFamilies = [
    {
      name: 'Fonte Primária',
      font: themeConfig.typography.fontFamily.primary,
      description: 'Usada para títulos e textos de destaque',
      sample: 'Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm',
    },
    {
      name: 'Fonte Secundária',
      font: themeConfig.typography.fontFamily.secondary,
      description: 'Usada para texto corporal e leitura',
      sample: 'Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm',
    },
    {
      name: 'Fonte Monoespaçada',
      font: themeConfig.typography.fontFamily.mono,
      description: 'Usada para código e dados',
      sample: 'Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Cabeçalho Premium */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Escala Tipográfica
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Sistema tipográfico profissional com hierarquia clara e legibilidade otimizada
        </p>
      </div>

      {/* Famílias de Fontes */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Famílias de Fontes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {fontFamilies.map((font, index) => (
            <div key={index} className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{font.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{font.description}</p>
              <p 
                className="text-lg text-gray-800 dark:text-gray-200"
                style={{ fontFamily: font.font }}
              >
                {font.sample}
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(`font-family: ${font.font};`)}
                className="mt-3 text-xs font-mono text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                font-family: {font.font};
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Escala Tipográfica */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Variantes Tipográficas
        </h2>
        <div className="space-y-4">
          {typographyVariants.map((typography, index) => (
            <TypographySample key={index} {...typography} />
          ))}
        </div>
      </Card>

      {/* Diretrizes de Uso */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Diretrizes de Uso
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Hierarquia Visual</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Use H1 apenas uma vez por página para o título principal
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                H2 para seções principais e títulos de conteúdo
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                H3-H6 para subtítulos e hierarquia interna
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Body para texto de leitura principal
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Melhores Práticas</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Mantenha consistência no uso de pesos de fonte
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Use line-height adequado para melhor legibilidade
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Evite mais de 3 famílias de fontes por projeto
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Teste legibilidade em diferentes tamanhos de tela
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TypographyScale;