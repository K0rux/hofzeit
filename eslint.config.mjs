import nextConfig from "eslint-config-next";

// shadcn/ui components in src/components/ui/ are third-party copy-paste components
// and must never be modified – exclude them from linting
const config = [
  { ignores: ["src/components/ui/**"] },
  ...nextConfig,
];

export default config;
