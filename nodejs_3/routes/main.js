const express = require('express')
const router = express.Router()
const db = require('../model')
const data = {
  skills: db.get('skills').value(),
  products: db.get('products').value()
}



router.get('/', (req, res, next) => {
  res.render('pages/index', { title: 'Main page', ...data, msgemail: req.flash('email')[0] })
})

router.post('/', (req, res, next) => {
  const letter = req.body

  db.defaults({letters: []}).write()

  db.get('letters').push(letter).write()
  
  req.flash('email', 'Ваше письмо успешно отправлено')
  res.redirect('/#email')
})

module.exports = router
