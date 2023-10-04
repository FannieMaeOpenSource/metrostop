const path = require('path');
const { merge } = require('webpack-merge');
const portFinderSync = require('portfinder-sync');
const commonConfiguration = require('./webpack.common.js');

const infoColor = (_message) => `\u001b[1m\u001b[34m${_message}\u001b[39m\u001b[22m`;

module.exports = merge(
  commonConfiguration,
  {
    stats: 'errors-warnings',
    mode: 'development',
    infrastructureLogging:
        {
          level: 'warn',
        },
    devServer:
        {
          host: 'local-ip',
          port: portFinderSync.getPort(8080),
          open: true,
          https: false,
          allowedHosts: 'all',
          hot: false,
          watchFiles: ['../src/**', '../static/**'],
          static:
            {
              watch: true,
              directory: path.join(__dirname, '../static'),
            },
          client:
            {
              logging: 'none',
              overlay: true,
              progress: false,
            },
          setupMiddlewares(middlewares, devServer) {
            console.log('------------------------------------------------------------');
            console.log(devServer.options.host);
            const { port } = devServer.options;
            const https = devServer.options.https ? 's' : '';
            const domain1 = `http${https}://${devServer.options.host}:${port}`;
            const domain2 = `http${https}://localhost:${port}`;

            console.log(`Project running at:\n  - ${infoColor(domain1)}\n  - ${infoColor(domain2)}`);

            return middlewares;
          },
        },
    module: {
      rules: [
        // CSS
        {
          test: /\.css$/,
          use:
                    [
                      'style-loader',
                      'css-loader',
                    ],
        },
      ],
    },
  },
);
