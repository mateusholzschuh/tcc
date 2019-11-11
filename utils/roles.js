const roles = []
roles['coordinator'] = 'Coordenação Geral'
roles['accreditation'] = 'Credenciamento'
roles['organization'] = 'Apoio/Organização'
roles['speaker'] = 'Palestrante'

exports.RoleName = (id) => {
    return roles[id] ? roles[id] : null
}