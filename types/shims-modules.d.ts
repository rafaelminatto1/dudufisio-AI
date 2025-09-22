// Shim declarations for modules not present in the Vite/React build
// This resolves TS2307 for Next.js and server-only modules referenced in the repo

declare module 'next-auth' { const anyExport: any; export = anyExport; }
declare module 'next-auth/react' { const anyExport: any; export = anyExport; }
declare module 'next-auth/middleware' { const anyExport: any; export = anyExport; }
declare module 'next-auth/providers/credentials' { const anyExport: any; export = anyExport; }
declare module '@next-auth/prisma-adapter' { const anyExport: any; export = anyExport; }

declare module 'next/server' { const anyExport: any; export = anyExport; }
declare module 'next/navigation' { const anyExport: any; export = anyExport; }
declare module 'next/cache' { const anyExport: any; export = anyExport; }

declare module 'bcryptjs' { const anyExport: any; export = anyExport; }
declare module 'redis' { const anyExport: any; export = anyExport; }
declare module 'web-vitals' { const anyExport: any; export = anyExport; }
declare module 'html2pdf.js' { const anyExport: any; export = anyExport; }
declare module '@prisma/client' { const anyExport: any; export = anyExport; }

declare module './prisma' { const anyExport: any; export = anyExport; }
declare module '@/lib/prisma' { const anyExport: any; export = anyExport; }

// Fallback for any unknown modules used only in server/test contexts
declare module '*?server' { const anyExport: any; export = anyExport; }

