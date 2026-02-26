module.exports = {
  apps: [{
    name: 'survivor50',
    script: 'dist/index.js',
    cwd: '/home/ubuntu/Survivor50Draft/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '256M',
    env: {
      NODE_ENV: 'production',
    },
  }],
};
