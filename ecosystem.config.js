module.exports = {
  apps : [{
    name: 'AuthorizationService',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    max_restarts: 10,
    watch: true,
    env: {
      DB_USER: 'admin',
      DB_PASSWORD: 'admin',
      DB_HOST: 'localhost',
      DB_PORT: '27017',
      DB_NAME: 'evnotify'
    }
  }]
};
