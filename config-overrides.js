const { override, useBabelRc, addBabelPlugin, addWebpackModuleRule } = require("customize-cra");

module.exports = override(
    useBabelRc(),
    addBabelPlugin("@babel/plugin-proposal-optional-chaining"),
    addBabelPlugin("@babel/plugin-proposal-nullish-coalescing-operator"),
    addWebpackModuleRule({
        test: /\.(js|mjs)$/,
        include: /node_modules\/(@walletconnect|unstorage)/,
        use: {
            loader: "babel-loader",
            options: {
                presets: ["@babel/preset-env", "react-app"],
                plugins: [
                    "@babel/plugin-proposal-optional-chaining",
                    "@babel/plugin-proposal-nullish-coalescing-operator",
                ],
            },
        },
    }),
    (config) => {
        /*
            Babel transpiles the destr module as static assets for some reason, so we need to exclude it from the file-loader
            The module is dependency of:
            @walletconnect/ethereum-provider
            │ └─┬ @walletconnect/types
            │   └─┬ @walletconnect/keyvaluestorage
            │     └─┬ unstorage
            │       ├── destr
        */
        return excludePathFromLoader(config, "file-loader", /node_modules\/destr/);
    }
);

function excludePathFromLoader(config, loaderName, excludePath) {
    const oneOfRule = config.module.rules.find((rule) => rule.oneOf);
    if (oneOfRule) {
        const rule = oneOfRule.oneOf.find((rule) => rule.loader && rule.loader.includes(loaderName));

        if (rule) {
            rule.exclude = rule.exclude || [];
            rule.exclude.push(excludePath);
        }
    }
    
    // the rule is modified by reference, so it is automatically updated inside the config object
    return config;
}
