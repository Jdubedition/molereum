const path = require('path')

module.exports = {
  target: 'webworker',
  entry: './src/index.ts',
  output: {
    filename: 'worker.js',
    path: path.join(__dirname, 'dist'),
  },
  devtool: 'cheap-module-source-map',
  mode: 'development',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          // transpileOnly is useful to skip typescript checks occasionally:
          // transpileOnly: true,
        },
      },
      {
        // This is needed as a workaround for ethers in Cloudflare Workers: https://github.com/ethers-io/ethers.js/issues/1886
        test: /\.js$/,
        loader: 'string-replace-loader',
        options: {
          multiple: [
            { search: 'request.mode = "cors";', replace: '/* request.mode = "cors"; */' },
            { search: 'request.cache = "no-cache";', replace: '/* request.cache = "no-cache"; */' },
            { search: 'request.credentials = "same-origin";', replace: '/* request.credentials = "same-origin"; */' },
            { search: 'request.referrer = "client";', replace: '/* request.referrer = "client"; */' }
          ]
        }
      }
    ],
  },
}
