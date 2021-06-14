describe('check the site for visual regressions', () => {
  beforeEach(() => {
    cy.eyesOpen({
      appName: Cypress.env('SITE_NAME'),
      batchName: Cypress.env('SITE_NAME'),
      browser: JSON.parse(Cypress.env('APPLITOOLS_BROWSERS')),
      failBuildOnDiff: Boolean(Cypress.env('APPLITOOLS_FAIL_BUILD_ON_DIFF')),
      serverUrl: Cypress.env('APPLITOOLS_SERVER_URL'),
      concurrency: Number(Cypress.env('APPLITOOLS_CONCURRENCY')),
    });
  });

  afterEach(() => {
    cy.eyesClose();
  });

  // TODO can we loop through all generated pages and check?
  const pagesToCheck = Cypress.env('PAGES_TO_CHECK');
  pagesToCheck.forEach((route) => {
    it(`Visual Diff for ${route}`, () => {
      cy.visit(route);
      cy.eyesCheckWindow({
        tag: route,
        ignore: Cypress.env('APPLITOOLS_IGNORE_SELECTOR'),
      });
    });
  });
});
