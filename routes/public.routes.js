const express = require('express')
const router = express.Router({ mergeParams: true })

// controllers
const controller = {
    certificate: require('../controllers/certificate.controller')
}

// validadors
const validator = require('../middlewares/validators/organizers')

// rota mostra formulário de validação
router.get('/validar-certificado', controller.certificate.showValidate)
router.post('/validar-certificado', controller.certificate.postValidate)
router.get('/validar-certificado/:key', controller.certificate.download)

router.get('/ver-certificados', controller.certificate.showCertificates)
router.post('/ver-certificados', controller.certificate.postCertificates)

// exporta o router
module.exports = router