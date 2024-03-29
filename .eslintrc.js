module.exports = {
  extends: 'airbnb-base',
  plugins: ['import'],
  env: {
    node: true,
    es6: true,
    mocha: true
  },
  globals: {
    fetch: false,
    URL: false
  },
  rules: {
    // enable additional rules
    quotes: ['error', 'single', { avoidEscape: true }],
    semi: ['error', 'always'],

    // disable rules from base configurations
    'no-underscore-dangle': 'off',
    'no-unused-expressions': 'off',
    'comma-dangle': 'off',
    'no-console': 'off',
    'no-use-before-define': 'off',
    'func-names': 'off',
    'consistent-return': 'off',
    'prefer-arrow-callback': 'off',
    'arrow-parens': 'off',
    // Windows friendly -- does not show errors on every line of every file
    'no-unused-vars': 1,
    'linebreak-style': 0
  }
};
