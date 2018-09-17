module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '10',
        },
        loose: true,
        useBuiltIns: 'entry',
        modules: 'commonjs',
      },
    ],
    '@babel/preset-flow',
    ['@babel/preset-stage-0', { decoratorsLegacy: true }],
  ],
  plugins: [],
};
