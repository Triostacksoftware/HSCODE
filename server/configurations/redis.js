import redis from 'redis';

const redisClient = redis.createClient({
  url: 'redis://localhost:6379', // or remote like redis://default:password@host:port
  socket: {
    reconnectStrategy: (retries) => {
      // retry delay in ms or false to stop retrying
      if (retries > 5) return false;
      return 1000; // 1 sec delay
    }
  }
});

redisClient.on('connect', () => console.log("Redis connected successfully"));
redisClient.on('error', (err) => console.log("Redis connection error: ",err.message));

await redisClient.connect();

export default redisClient;