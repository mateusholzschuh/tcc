const roles = []
roles['coordinator'] = { name:'Coordenação Geral', extends: 'accreditation' }
roles['accreditation'] = { name:'Credenciamento', extends: 'organization' }
roles['organization'] = { name:'Apoio/Organização', extends: 'speaker' }
roles['speaker'] = { name:'Palestrante', extends: null }

exports.RoleName = (id) => {
    return roles[id] ? roles[id].name : null
}

/**
 * @param {'coordinator'|'accreditation'|'organization'|'speaker'} role
 */
exports.HasPermission = async (role, user, event) => {
    if (user.isAdmin) return true
    if (role == null || role == 'admin') return false
    
    let ue = await require('../models/user-event.model').findOne({ user, event })

    if (!(ue && ue.role)) 
        return false

    // recursive role check
    let roleRecursive = roles[ue.role]

    while (roleRecursive) {
        if (roleRecursive.name == roles[role].name)
            return true
        roleRecursive = roles[roleRecursive.extends]
    }

    return false
}