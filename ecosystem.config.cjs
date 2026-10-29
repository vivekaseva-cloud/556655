/**
 * PM2 Process Configuration for Hostinger VPS / Node.js
 * Usage: pm2 start ecosystem.config.cjs
 */
module.exports = {
  apps: [
    {
      name: 'neti-bharatam',
      script: 'server.cjs',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      watch: false,
      max_memory_restart: '500M',
      time: true,
    },
  ],
};
