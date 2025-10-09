import React from 'react';
/**
 * Skip to Content Link
 * Melhora acessibilidade permitindo usuários de teclado pular navegação
 */
const SkipToContent = () => {
    return (<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
      Pular para o conteúdo principal
    </a>);
};
export default SkipToContent;
