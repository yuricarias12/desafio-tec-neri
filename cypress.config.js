const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'https://barrigarest.wcaquino.me',
  },
});


 // Usar caso precise diminuir ou aumentar o tempo padrão do Cypress em que ele espera até negar uma assertiva defaultCommandTimeout: 1000,