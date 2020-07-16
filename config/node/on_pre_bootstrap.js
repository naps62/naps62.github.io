const fs = require(`fs`);
const mkdirp = require(`mkdirp`);
const path = require(`path`);

const { postsPath, pagesPath } = require(`../options`);

// Ensure that content directories exist at site-level
// If non-existent they'll be created here (as empty folders)
module.exports = ({ reporter, store }) => {
  const { program } = store.getState();

  const dirs = [
    path.join(program.directory, postsPath),
    path.join(program.directory, pagesPath),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      reporter.info(`Initializing "${dir}" directory`);
      mkdirp.sync(dir);
    }
  });
};
