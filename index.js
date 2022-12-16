import express from 'express'
import fetch from 'node-fetch'
import redis from 'redis'

const PORT = process.env.PORT || 3000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient({
  port : REDIS_PORT,
  enable_offline_queue: false,
  legacyMode: true
});
await client.connect();
const app = express();

// Create template for sending response to client
function sendData(username, count) {
  return `<h1>${username} is having ${count} repositories</h1>`;
}

// Get data from github
async function getRepos(req, res, next) {
  try {
    const { username } = req.params;
    const response = await fetch(`https://api.github.com/users/${username}`);
    const data = await response.json();
    const count = data.public_repos;

    // Feed data to Redis
    client.setEx(username, 100, count);
    res.send(sendData(username, count));
  }
  catch (err) {
    console.error(err);
    res.status(500);
  }
}

// Cache middleware
function cache(req, res, next) {
  const { username } = req.params;
  client.get(username, (err, count) => {
    if (err) throw err;
    if (count !== null) {
      res.send(sendData(username, count));
    } else {
      next();
    }
  });
}

app.get('/repos/:username', cache, getRepos);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
