const http = require('http');
const path = require('path');
const ecstatic = require('ecstatic');
const fs = require('fs-extra');
const glob = require('glob');

module.exports = {
  onPostBuild: async ({ constants: { PUBLISH_DIR }, utils }) => {
    if (!process.env.APPLITOOLS_API_KEY) {
      utils.build.failPlugin(
        'No Applitools API key found! Set APPLITOOLS_API_KEY with your API key from https://eyes.applitools.com',
      );
    }

    const port = 9919;
    const server = http
      .createServer(ecstatic({ root: `${PUBLISH_DIR}` }))
      .listen(port);

    fs.copy(
      path.resolve(__dirname, 'template/visual-diff.json'),
      path.resolve(PUBLISH_DIR, '..', 'visual-diff.json'),
    );

    fs.copy(
      path.resolve(__dirname, 'template/visual-diff'),
      path.resolve(PUBLISH_DIR, '..', 'visual-diff'),
    );

    const cypress = require('cypress');
    const builtPages = glob
      .sync(`${PUBLISH_DIR}/**/*.html`)
      .map((p) => path.dirname(p.replace(PUBLISH_DIR, '')));

    const results = await cypress.run({
      configFile: 'visual-diff.json',
      config: { baseUrl: `http://localhost:${port}` },
      env: {
        APPLITOOLS_BATCH_ID: 'visual diff',
        PAGES_TO_CHECK: builtPages,
      },
      record: false,
    });

    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });

    if (results.failures) {
      utils.build.failPlugin(`Cypress had a problem`, {
        error: new Error(results.message),
      });
    }

    if (results.totalFailed) {
      // take just the first run
      const run = results.runs.find(Boolean);

      // find the failed test
      const test = run.tests.find((t) => t.state === 'failed');

      // pull out the Applitools review URL
      const url = test.stack.match(/(https:\/\/eyes\.applitools\.com[\S]*)/)[0];

      utils.build.failBuild(
        'Visual changes were detected. Confirm the changes in Applitools, then rerun this build.',
        {
          error: new Error(`Review the detected changes at \n${url}`),
        },
      );
    }
  },
};
