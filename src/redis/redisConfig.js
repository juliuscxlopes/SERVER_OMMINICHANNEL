const Redis = require('ioredis');


const redis = new Redis(process.env.REDIS_PUBLIC_URL);

module.exports = redis;
