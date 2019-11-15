module.exports = {
  plugins: {
    babel: {
      plugins: [
["@babel/transform-runtime", {
    corejs: 2,
  }]
      ],
      externalHelpers: true,
      runtimeHelpers: true
    }
  }
}
