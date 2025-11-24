import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactHooksPlugin from "eslint-plugin-react-hooks"; // Add this line

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    ignores: ["src/types/database.types.ts"],
    plugins: { // Add plugins object
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
