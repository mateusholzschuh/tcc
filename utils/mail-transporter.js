const nodemailer = require('nodemailer')
const { MAIL_SERVICE, MAIL_ADDR, MAIL_PASS } = require('../config')

module.exports = nodemailer.createTransport({
    service: MAIL_SERVICE || 'gmail',
    auth: {
        user: MAIL_ADDR,
        pass: MAIL_PASS
    }
})