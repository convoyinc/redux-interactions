import * as http from 'http';
import connect from 'connect';
import opener from 'opener';
import request from 'request';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import devConfig from './webpack.config.development.babel';

const PORT     = process.env.PORT || 3000;
const URL      = `http://localhost:${PORT}`;
const COMPILER = webpack(devConfig);

const app = connect();
app.use(webpackDevMiddleware(COMPILER, {
  publicPath: devConfig.output.publicPath,
  // noInfo: true,
  stats: {
    colors: true,
  },
}));
app.use(webpackHotMiddleware(COMPILER));

app.use((_req, res) => {
  // Render the (HTML) index for every unknown URL.
  request(URL).pipe(res);
});

http.createServer(app).listen(PORT, error => {
  if (error) {
    console.error(error);
    process.exit(1);
  }
  opener(URL);
});
