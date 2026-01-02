import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL!;
const isCluster = process.env.ENVIRONMENT === 'production';

const redis = isCluster
    ? new Redis.Cluster([redisUrl], {
        dnsLookup: (address, callback) => callback(null, address),
        redisOptions: {
            tls: isCluster ? {} : undefined,
        },
    })
    : new Redis(redisUrl);

export default redis;
