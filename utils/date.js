const moment = require('moment')

moment.locale('pt-BR')

/**
 * @param {Date} date Input date
 * @returns {String} [day] de [month] de [year]. Example: 8 de dezembro de 2019
 */
exports.toCompleteDate = (date) => {
    return moment(date).format('D [de] MMMM [de] YYYY').toLowerCase()
}