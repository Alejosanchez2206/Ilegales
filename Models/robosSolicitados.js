const { model , Schema } = require('mongoose')

let robosSchema = new Schema({
    guild: String,
    idrobo: String,
    user: String,
    organizacion: String,
    fecha: String,
    hora: String,
    robo: String,
    personas: Number,
    aprobado : Boolean
}, {
    versionKey: false
})

module.exports = model('robos', robosSchema)