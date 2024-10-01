// helpers.js
const generarId = () => {
    const timestamp = Date.now().toString();
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numeros = timestamp.slice(-3);
    const generarLetra = () => letras[Math.floor(Math.random() * letras.length)];
    const id = Array(3).fill(null).map(generarLetra).join('') + numeros;
    return id;
};

module.exports = { generarId };  // Exporta la función
