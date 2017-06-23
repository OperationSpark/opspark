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
        "no-console": "off",
    }
};
