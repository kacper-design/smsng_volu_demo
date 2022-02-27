module.exports = {
  // ...
  entry: {
    app: "src/app.js",
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
