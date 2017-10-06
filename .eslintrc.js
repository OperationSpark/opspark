module.exports = {
    "extends": "airbnb-base",
    "plugins": [
        "import"
    ],
		"rules": {
        // enable additional rules
        "quotes": ["error", "single"],
        "semi": ["error", "always"],

        // override default options for rules from base configurations
        "comma-dangle": ["error", "always"],

        // disable rules from base configurations
        "no-underscore-dangle": "off",
        "no-unused-expressions": "off",
        "no-unused-vars": "off",
        "comma-dangle": "off",
        "no-console": "off",
        "no-use-before-define": "off",
        "func-names": "off",
        "consistent-return": "off",
        "prefer-arrow-callback": "off",
    }
};
