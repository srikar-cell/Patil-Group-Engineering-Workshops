/*function add(a, b) {
    return a + b;
}*/

function myfunction(input) {
    if (typeof input !== 'number') {
        throw new Error('invalid Input')
    }
}

module.exports = myfunction;