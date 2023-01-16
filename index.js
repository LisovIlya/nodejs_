const fs = require('fs');
const yargs = require('yargs');
const path = require('path');

const args = yargs
  .usage('Usage: node $0 [options]')
  .help('help')
  .alias('help', 'h')
  .version('0.0.1')
  .alias('version', 'v')
  .example('node $0 --entry path --dist path --delete || npm run start -- -e path -d path -D')
  .option('entry', {
    alias: 'e',
    describe: 'Путь к читаемой директории',
    default: 'src',
  })
  .option('dist', {
    alias: 'd',
    describe: 'Путь куда выложить результат сортировки',
    default: 'dist',
  })
  .option('delete', {
    alias: 'D',
    describe: 'Удалить ли исходную директорию?',
    boolean: true,
    default: false,
  })
  .epilog('nodejs_1')
  .argv;

const config = {
  src: path.normalize(path.join(__dirname, args.entry)),
  dist: path.normalize(path.join(__dirname, args.dist)),
  delete: args.delete,
};

if (!fs.existsSync(config.dist)) {
  fs.mkdirSync(config.dist);
}

const readDir = (base) => {
  const files = fs.readdirSync(base, (err) => { if (err) throw err; });

  files.forEach((item) => {
    const localBase = path.join(base, item);
    const state = fs.statSync(localBase);
    if (state.isDirectory()) {
      readDir(path.join(base, item));
    } else {
      const itemDir = path.join(config.dist, item.charAt(0).toLowerCase());
      const itemPath = path.join(itemDir, item);
      if (!fs.existsSync(itemDir)) {
        fs.mkdirSync(itemDir);
      }

      if (!fs.existsSync(itemPath)) {
        fs.rename(localBase, itemPath, (err) => { if (err) { console.log(err); } });
      }
    }
  });
};

readDir(config.src);

if (config.delete) {
  fs.rm(config.src, { recursive: true }, (err) => { if (err) { console.log(err); } });
}
