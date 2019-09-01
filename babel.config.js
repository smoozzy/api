module.exports = {
    presets: [
        ['@babel/preset-env', {
            corejs: 3,
            modules: false,
            useBuiltIns: 'usage',
        }],
    ],

    env: {
        test: {
            presets: [
                '@babel/preset-env',
            ],
        },
    },
};
