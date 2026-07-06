/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */

const config = {
  plugins: ['prettier-plugin-tailwindcss'],
  singleQuote: true,
  jsxSingleQuote: false,
  semi: true,
  tabWidth: 2,
  trailingComma: 'all',
};

export default config;
