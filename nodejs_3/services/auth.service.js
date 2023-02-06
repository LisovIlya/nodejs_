const crypto = require('crypto')

const db = require('../model')

class AuthService {
    login({email, password}) {
        const user = db.get('user').value()
        
        if (!user) {
            throw new Error('Не верный логин или пароль')
        }

        const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 512, 'sha512').toString('hex')

        if (hash === user.hash && user.email === email) {
            return true
        }
        
        throw new Error('Не верный логин или пароль')
    }

    registration({email, password}) {
        const salt = crypto.randomBytes(16).toString('hex') // создает рандомную строку и дешифрует из двоичного кода
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 512, 'sha512').toString('hex') // кодирует, некоторыам кол-вом итераций перемешивает значение с рандомной строкой, кол-ва символов в строке и кодирование

        db.set('user', {
            email,
            salt,   // соль в дальнейшем при введении на клиенте оригинального пароля перемешивается с ним и сравнивается
            hash    // с ранее сгенерированным хешем
        }).write()
    }
}

module.exports = new AuthService()