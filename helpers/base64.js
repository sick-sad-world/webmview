module.exports = {
  encode: (str) => new Buffer(str, 'utf-8').toString('base64'),
  decode: (str) => new Buffer(str, 'base64').toString('utf-8')
}