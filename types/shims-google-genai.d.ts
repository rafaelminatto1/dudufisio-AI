// Temporary shim to align with the installed @google/genai API surface
// Some files import { GoogleGenAI } but the package exports createGoogleGenerativeAI or a default
declare module '@google/genai' {
  export class GoogleGenerativeAI {
    constructor(apiKeyOrOptions: string | { apiKey: string });
    models?: any;
    getGenerativeModel?: (config: any) => any;
  }
  export const HarmCategory: any;
  export const HarmBlockThreshold: any;
  export const Type: any;
  const defaultExport: any;
  export default defaultExport;
}

