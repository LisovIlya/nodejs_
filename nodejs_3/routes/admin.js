const express = require('express')
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')
const router = express.Router()
const db = require('../model')


router.get('/', (req, res, next) => {
  const skills = db.get('skills').value()
  if (!req.session.auth) {
    req.flash('login', 'Авторизуйтесь!')
    return res.redirect('/login')
  }
  res.render('pages/admin', { title: 'Admin page', skills })
})

router.post('/skills', (req, res, next) => {
  
  const {age, concerts, cities, years} = req.body

  const skills = [
    {
      "number": age,
      "text": "Возраст начала занятий на скрипке"
    },
    {
      "number": concerts,
      "text": "Концертов отыграл"
    },
    {
      "number": cities,
      "text": "Максимальное число городов в туре"
    },
    {
      "number": years,
      "text": "Лет на сцене в качестве скрипача"
    }
  ]

  db.set('skills', skills).write()
  res.render('pages/admin', {title: 'Admin page', skills, msgskill: 'Данные успешно обновлены' })
})

router.post('/upload', (req, res, next) => {
  const skills = db.get('skills').value()

  const form = new formidable.IncomingForm()
  const upload = path.join('./public', 'assets', 'img', 'products')

  if (!fs.existsSync(upload)) {
    fs.mkdirSync(upload)
  }

  const fileFolder = path.join(process.cwd(), upload)

  form.uploadDir = fileFolder

  form.parse(req, function(err, fields, files) {
    if (err) {
      return next(err)
    }

    const filePath = path.join(fileFolder, files.photo.newFilename)
    const fileName = path.join(fileFolder, files.photo.originalFilename)
    fs.rename(filePath, fileName, function(err) {
      if (err) {
        console.error(err.message)
        return next(err)
      }

      const newFilePath = `./assets/img/products/${files.photo.originalFilename}`

      db.get('products').push({
        "src": newFilePath,
        "name": fields.name,
        "price": fields.price
      }).write()
      
      res.render('pages/admin', {title: 'Admin page', skills, msgfile: 'Товар успешно добавлен' })
    })
  })
})

module.exports = router
