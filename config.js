const { GREENLIGHT_HOST, NODE_ENV } = process.env;

module.exports = {
  isDevMode: NODE_ENV === 'development',
  devGreenlightHost: GREENLIGHT_HOST || 'http://localhost:3000'
};
