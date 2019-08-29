// @see https://jestjs.io/docs/en/configuration.html

module.exports = {
    // tests, modules and aliases
    moduleFileExtensions: ['js', 'json'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testMatch: [
        '**/tests/unit/**/*.spec.js|**/__tests__/*.js',
    ],

    // transformers
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    transformIgnorePatterns: [
        '/node_modules/',
    ],

    // environment
    testURL: 'http://localhost/',

    // mocks
    resetMocks: true,

    // coverage
    collectCoverageFrom: [
        'src/**/*.js',
        '!**/node_modules/**',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['html', 'text'],

    // watcher
    watchPlugins: [
        'jest-watch-typeahead/filename',
        'jest-watch-typeahead/testname',
    ],
};
