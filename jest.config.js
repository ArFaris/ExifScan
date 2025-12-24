export default {
  testEnvironment: 'jsdom',
  transform: {},
  testMatch: ['<rootDir>/__tests__/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/mocks/'],
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/__tests__/mocks/emptyMock.js'
  }
};