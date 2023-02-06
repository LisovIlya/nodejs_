const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')  // позволяет синхронизировать файлы
const path = require('path')

const adapter = new FileSync(path.resolve(__dirname, '..', 'data.json'))

module.exports = low(adapter)