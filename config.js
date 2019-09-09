module.exports = {

    SERVER_PORT : process.env.PORT || 3000,
    MONGODB_URI : process.env.MONGODB_URI || 'mongodb://localhost:27017/eventos',

    MAIL_ADDR : process.env.MAIL_ADDR,
    MAIL_PASS : process.env.MAIL_PASS
    
}