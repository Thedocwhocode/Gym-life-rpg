module.exports = function (api) {
  api.cache(true);
  return {
    // import.meta: o pdf.js (leitor de ficha na web) é ESM e usa; o Metro web não aceita sem o polyfill.
    presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
    plugins: [
      '@babel/plugin-proposal-export-namespace-from',
      [
        "babel-plugin-inline-import",
        {
          "extensions": [".svg"]
        }
      ],
      'react-native-worklets/plugin',
    ],
  };
};
