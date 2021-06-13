const http = require('http');
const path = require('path');
const ecstatic = require('ecstatic');
const fs = require('fs-extra');
const glob = require('glob');

const createEnvFile = async ({ inputs, builtPages }) => {
  await fs.writeJSON(`${__dirname}/cypress.env.json`, {
    SITE_NAME: process.env.SITE_NAME || 'localhost-test',
    APPLITOOLS_BROWSERS: JSON.stringify(inputs.browser),
    APPLITOOLS_FAIL_BUILD_ON_DIFF: inputs.failBuildOnDiff,
    APPLITOOLS_SERVER_URL: inputs.serverUrl,
    APPLITOOLS_IGNORE_SELECTOR: inputs.ignoreSelector
      ? inputs.ignoreSelector
          .split(',')
          .map((selector) => ({ selector: selector.trim() }))
      : [],
    APPLITOOLS_CONCURRENCY: inputs.concurrency,
    PAGES_TO_CHECK: builtPages,
    CYPRESS_CACHE_FOLDER: './node_modules/CypressBinary',
  });
};

const runCypress = async ({ utils, port }) => {
  await utils.run(
    'node',
    ['cypress.js', 'run', '--config', `baseUrl=http://localhost:${port}`],
    { cwd: __dirname },
  );

  return await fs.readJSON(`${__dirname}/results.json`);
};

const shutdownServer = async ({ server }) => {
  await new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
};

module.exports = {
  onPreBuild: async ({ utils }) => {
    // bail immediately if this isn’t a production build
    if (process.env.CONTEXT !== 'production') return;

    await utils.run('cypress', ['install'], {
      stdio: 'ignore',
      cwd: __dirname,
    });
  },
  onPostBuild: async ({ constants: { PUBLISH_DIR }, utils, inputs }) => {
    // bail immediately if this isn’t a production build
    if (process.env.CONTEXT !== 'production') return;

    if (!process.env.APPLITOOLS_API_KEY) {
      utils.build.failPlugin(
        'No Applitools API key found! Set APPLITOOLS_API_KEY with your API key from https://eyes.applitools.com',
      );
    }

    const port = 9919;
    const server = http
      .createServer(ecstatic({ root: `${PUBLISH_DIR}` }))
      .listen(port);

    const builtPages = glob
      .sync(`${PUBLISH_DIR}/**/*.html`)
      .map((p) => path.dirname(p.replace(PUBLISH_DIR, '')));

    await createEnvFile({ inputs, builtPages });
    const results = await runCypress({ utils, port });
    await shutdownServer({ server });

    if (results.failures) {
      utils.build.failPlugin(`Cypress had a problem`, {
        error: new Error(results.message),
      });
    }

    if (inputs.failBuildOnDiff && results.totalFailed) {
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
  onEnd: async () => {
    // cleanup transient files
    await Promise.all(
      [
        `${__dirname}/cypress.env.json`,
        `${__dirname}/cypress`,
        `${__dirname}/results.json`,
      ].map((pathToRemove) => fs.remove(pathToRemove)),
    );
  },
};
