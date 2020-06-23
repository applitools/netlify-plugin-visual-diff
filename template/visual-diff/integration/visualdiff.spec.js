describe('check the site for visual regressions', () => {
  before(() => {
    cy.eyesOpen({
      appName: process.env.SITE_NAME || 'localhost-test',
      batchName: process.env.SITE_NAME || 'localhost-test',
      testName: 'Visual Diff',
      browser: JSON.parse(Cypress.env('APPLITOOLS_BROWSERS')),
    });
  });

  after(() => {
    cy.eyesClose();
  });

  // TODO can we loop through all generated pages and check?
  const pagesToCheck = Cypress.env('PAGES_TO_CHECK');
  pagesToCheck.forEach((route) => {
    it(`check ${route} for visual changes`, () => {
      cy.visit(route);
      cy.eyesCheckWindow();
    });
  });
});
