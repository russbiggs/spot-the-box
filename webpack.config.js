const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
	entry: './src/index.js',
	optimization: {
		minimize: true,
		minimizer: [ new TerserPlugin() ]
	},
	module: {
		rules: [
			{
				test: /\.(js)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			}
		]
	},
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	}
};