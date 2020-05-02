describe('check the site for visual regressions', () => {
  beforeEach(() => {
    cy.eyesOpen({
      appName: process.env.URL || 'localhost test',
      batchName: Cypress.env('APPLITOOLS_BATCH_ID'),
    });
  });

  afterEach(() => {
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
