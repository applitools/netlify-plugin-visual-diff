const fs = require('fs-extra');
const cypress = require('cypress');

const main = async () => {
  const runOptions = await cypress.cli.parseRunArguments(process.argv.slice(2));
  const results = await cypress.run(runOptions);
  await fs.writeJSON('results.json', results);
};

main();
