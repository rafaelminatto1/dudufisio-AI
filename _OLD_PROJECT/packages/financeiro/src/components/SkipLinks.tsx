import React from 'react';

export const SkipLinks: React.FC = () => {
  const { skipLinks, focusElement } = useSkipLinks();

  return (
    <div className="sr-only focus-within:not-sr-only">
      {skipLinks.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(e) => {
            e.preventDefault();
            focusElement(id);
          }}
          className="block p-2 bg-blue-600 text-white focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {label}
        </a>
      ))}
    </div>
  );
};
