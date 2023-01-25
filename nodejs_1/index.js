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

function readdir(src) {
  return new Promise((resolve, reject) => {
    fs.readdir(src, (err, files) => {
      if (err) reject(err);
      resolve(files);
    });
  });
}

function stat(localPath) {
  return new Promise((resolve, reject) => {
    fs.stat(localPath, (err, stats) => {
      if (err) reject(err);
      resolve(stats);
    });
  });
}

function createDir(src) {
  return new Promise((resolve, reject) => {
    fs.mkdir(src, (err) => {
      if (err && err.code === 'EEXIST') resolve();
      if (err) reject(err);

      resolve();
    });
  });
}

function copyFile(src, dist) {
  return new Promise((resolve, reject) => {
    fs.link(src, dist, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

function removeFile(src) {
  return new Promise((resolve, reject) => {
    fs.unlink(src, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

function removeDir(src) {
  return new Promise((resolve, reject) => {
    fs.rm(src, { recursive: true }, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

function existPath(src) {
  return new Promise((resolve, reject) => {
    fs.access(src, fs.constants.F_OK, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

(async function() {
  async function sorter(src) {
    const files = await readdir(src);
  
    for (const item of files) {
      const srcItemPath = path.join(src, item);
      const stats = await stat(srcItemPath);
  
      if (stats.isDirectory()) {
        await sorter(srcItemPath);
        if (config.delete) {
          await removeDir(srcItemPath);
        }
      } else {
        const itemDir = path.join(config.dist, item.charAt(0).toLowerCase());
        const distItemPath = path.join(itemDir, item);
        await createDir(config.dist);
        await createDir(itemDir);
        if (!await existPath(distItemPath)) {
          await copyFile(srcItemPath, distItemPath);
        }
        if (config.delete) {
          await removeFile(srcItemPath);
        }
      }
    }
  }
  
  try {
    await sorter(config.src);
    if (config.delete) {
      await removeDir(config.src)
    }
  } catch (err) {
    console.log(err);
  }
})()
