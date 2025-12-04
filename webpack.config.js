const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Only adjust for development (safe for local use)
  if (env.mode === 'development') {
    config.devServer.headers = {
      ...config.devServer.headers,
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';",
    };
  }

  return config;
};
