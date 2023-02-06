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
  const upload = path.join(process.cwd(), 'images')

  if (!fs.existsSync(upload)) {
    fs.mkdirSync(upload)
  }


  form.uploadDir = upload

  form.parse(req, function(err, fields, files) {
    if (err) {
      return next(err)
    }

    const newFilePath = path.join(upload, files.photo.newFilename)
    const originalFilePath = path.join(upload, files.photo.originalFilename)

    fs.rename(newFilePath, originalFilePath, function(err) {
      if (err) {
        console.error(err.message)
        return next(err)
      }

      db.get('products').push({
        "src": `../images/${files.photo.originalFilename}`,
        "name": fields.name,
        "price": fields.price
      }).write()
      
      res.render('pages/admin', {title: 'Admin page', skills, msgfile: 'Товар успешно добавлен' })
    })
  })
})

module.exports = router
