import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".next-dev/**",
      ".vercel/**",
      "node_modules/**",
      "scratch/**",
    ],
  },
  ...nextVitals,
  ...nextTypescript,
];

export default eslintConfig;
