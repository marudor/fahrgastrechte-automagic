module.exports = {
  extends: ['marudor/noReact'],
  parser: 'babel-eslint',
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  globals: {
    PROD: false,
    SERVER: false,
  },
  rules: {},
  settings: {},
};
