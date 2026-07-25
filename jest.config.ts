import type { Config } from './node_modules/@jest/types';
const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    // Only exercised by tests/postgreSQL/**, which are skipped in CI (no
    // DATABASE_URL available there) and run locally against a real DB.
    '!src/repository/postgresql/**',
    '!src/repository/sqlite/**',
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      functions: 85,
      statements: 75,
    },
  },
};
export default config;
