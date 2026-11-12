const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on) {
      on('task', { compareSnapshot: require('./cypress/plugins/compare-snapshot').compareSnapshot });
    },
    viewportHeight: 800,
    viewportWidth: 400,
    defaultCommandTimeout: 30000,
    baseUrl: 'http://127.0.0.1:8081',
  },
});
