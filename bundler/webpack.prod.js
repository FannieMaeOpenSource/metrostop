const { merge } = require('webpack-merge');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const commonConfiguration = require('./webpack.common.js');

module.exports = merge(
  commonConfiguration,
  {
    mode: 'production',
    plugins:
        [
          new CleanWebpackPlugin(),
          new MiniCSSExtractPlugin({ filename: "[name].[contentHash].css"})
        ],
    module: {
        rules: [
         // CSS
         {
         test:  /\.(sass|less|css)$/,
             use:
                 [
                 MiniCSSExtractPlugin.loader,
                 'css-loader',
                 ],
         },
        ]
        },
  },
);
