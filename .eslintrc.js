const isProduction = process.env.NODE_ENV === 'production';


module.exports = {
    root: true,

    env: {
        browser: true,
        es6: true,
        node: true,
    },

    'extends': [
        'eslint:recommended',
    ],

    rules: {
        'no-console': isProduction ? 'error' : 'off',
        'no-debugger': isProduction ? 'error' : 'off',
    },

    parserOptions: {
        parser: 'babel-eslint',
        sourceType: 'module',
    },
};
