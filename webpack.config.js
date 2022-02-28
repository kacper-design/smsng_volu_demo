const path = require("path");

module.exports = {
  // ...
  entry: {
    app: "src/index.js",
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
    ],
  },
  output: {
    path: "./",
    filename: "bundle.js",
    sourceMapFilename: "bundle.js.map",
  },

  devtool: "source-map",
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  // ...
};
