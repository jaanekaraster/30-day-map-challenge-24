const path = require('path');
const Dotenv = require('dotenv-webpack');
console.log("i am in webpack config")
module.exports = {
  entry: './app.js', // Your entry file
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new Dotenv(), // Load the .env file variables into the project
  ],
  mode: 'development', // or 'production'
};
