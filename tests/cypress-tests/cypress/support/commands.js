// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

/// <reference types="./index.d.ts" />

Cypress.Commands.add('getByTestId', (testId) => {
    return cy.get('[data-testid=' + testId + ']')
})

Cypress.Commands.add('findByTestId', { prevSubject: 'element' }, (subject, testId) => {
    return cy.wrap(subject).find(`[data-testid="${testId}"]`);
});

Cypress.Commands.add('navigate', (navButtonText) => {
    return cy.get('[data-testid=nav]').findByTestId('nav__' + navButtonText.toLowerCase()).click({ force: true }).click({ force: true })
})

Cypress.Commands.add('dialog', () => {
    return cy.get('[data-testid=fullscreen-dialog]:visible, [data-testid=modal-surface]:visible')
});
Cypress.Commands.add('completeWelcomeWizard', () => {
    return cy.getByTestId('welcome-wizard-next').click().click().click()
});

// Screenshots the element with this test id and diffs it against cypress/snapshots/<testId>.png.
Cypress.Commands.add('matchSnapshot', (testId) => {
    let screenshotPath
    return cy.getByTestId(testId)
        .screenshot(testId, { overwrite: true, onAfterScreenshot: (_el, props) => { screenshotPath = props.path } })
        .then(() => cy.task('compareSnapshot', { name: testId, screenshotPath }))
        .then((result) => {
            if (result.status === 'new') cy.log(`new reference: snapshots/new/${testId}.png`)
            expect(result.status, result.reason).not.to.equal('failed')
        })
});

Cypress.Commands.add('recursionLoop', { times: 'optional' }, function (fn, times) {
    if (typeof times === 'undefined') {
        times = 0;
    }

    cy.then(() => {
        const result = fn(++times);
        if (result !== false) {
            cy.recursionLoop(fn, times);
        }
    });
});
