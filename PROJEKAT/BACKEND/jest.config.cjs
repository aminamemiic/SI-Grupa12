module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/tests"],
    moduleFileExtensions: ["ts", "js", "json"],
    clearMocks: true,
    testMatch: ["**/tests/**/*.test.ts"],
    collectCoverageFrom: [
        "BLL/**/*.ts",
        "DAL/**/*.ts",
        "EXTERNAL/**/*.ts",
        "PRESENTATION API/**/*.ts",
        "!**/*.d.ts"
    ],
    coverageThreshold: {
        global: {
            lines: 80,
            branches: 80,
            functions: 80,
            statements: 80
        }
    }
};