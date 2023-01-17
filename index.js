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

function createDir(src, cb) {
  fs.mkdir(src, (err) => {
    if (err && err.code === 'EEXIST') { return cb(null); }
    if (err) { return cb(err); }

    cb(null);
  });
}

// function createDir(src, cb) {
//   if (fs.existsSync(src)) {
//     cb(null);
//   } else {
//     console.log(); // если убрать этот метод, то появляется ошибка считывания
//     fs.mkdir(src, (err) => {
//       if (err) {
//         cb(err);
//       } else {
//         cb(null);
//       }
//     });
//   }
// }

// function createDir(src, cb) {
//   fs.exists(src, (exist) => {
//     if (exist) {
//       cb();
//     } else {
//       fs.mkdir(src, (err) => {
//         if (err) {
//           cb(err);
//         } else {
//           cb();
//         }
//       });
//     }
//   });
// }

// function createDir(src, cb) {
//   fs.access(src, fs.constants.F_OK, (err) => {
//     if (err) {
//       fs.mkdir(src, (e) => {
//         if (e) {
//           cb(e);
//         } else {
//           cb(null);
//         }
//       });
//     } else {
//       cb(null);
//     }
//     // console.log(`${src} ${err ? 'does not exist' : 'exists'}`, err);
//   });
// }

function sorter(src) {
  fs.readdir(src, (err, files) => {
    if (err) throw err;
    files.forEach((item) => {
      const localPath = path.join(src, item);
      fs.stat(localPath, (e, stats) => {
        if (e) throw e;
        if (stats.isDirectory()) {
          sorter(localPath);
        } else {
          createDir(config.dist, (err) => {
            if (err) throw err;
            const itemDir = path.join(config.dist, item.charAt(0).toLowerCase());
            createDir(itemDir, (err) => {
              if (err) throw err;
              const itemPath = path.join(itemDir, item);
              fs.access(itemPath, fs.constants.F_OK, (err) => {
                if (err) {
                  fs.link(localPath, itemPath, (err) => {
                    if (err) throw err;
                    if (config.delete) {
                      fs.unlink(localPath, (err) => {
                        if (err) throw err;
                        fs.rm(src, { recursive: true }, (err) => {
                          if (err) throw err;
                        });
                      });
                    }
                  });
                }
              });
            });
          });
        }
      });
    });
  });
}

try {
  sorter(config.src);
} catch (err) {
  console.log(err);
}
