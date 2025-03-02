const { model, Schema } = require('mongoose')

let negociosSchema = new Schema({
    guildNegocio: String,
    guildRol: String,
    nombreOrganizacion: String,
    puntosOrg: Number
}, {
    versionKey: false
})

module.exports = model('organizaciones', negociosSchema)