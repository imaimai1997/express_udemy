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
      indent: ["error", 2, { SwitchCase: 1 }],
      quotes: ["error", "double"],
      semi: ["error", "always"],
      "no-used-vars": [
        "error",
        {
          vars: "all",
          args: "none",
        },
      ],
      "no-console": ["off"],

      ...recommendedRules,
    },
  },
];
