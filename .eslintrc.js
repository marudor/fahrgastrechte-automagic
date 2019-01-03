module.exports = {
  extends: ['joblift/base', 'joblift/flowtype'],
  env: {
    node: true,
    es6: true,
  },
  settings: {
    'import/resolver': 'webpack',
  },
};
