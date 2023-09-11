export default {
  preset: '',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.jsx?$': 'babel-jest', // Adding this line solved the issue
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  testMatch: ['<rootDir>/**/*.(test|spec).(js)'],
};
