const { rules: recommendedRules } = require("eslint/conf/eslint-recommended");
const globals = require("globals");

module.exports = [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        jquery: true,
        $: true,
      },
    },
    rules: {
      ...recommendedRules,
    },
  },
];
