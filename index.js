import express from 'express'
import fetch from 'node-fetch'
import redis from 'redis'

const PORT = process.env.PORT || 3000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient(REDIS_PORT);
await client.connect();
const app = express();

// Create template for sending response to client
function setResponse(username, repos) {
  return `<h1>${username} is having ${repos} repositories</h2>`;
}

// Get data from github
async function getRepos(req, res, next) {
  try {
    const { username } = req.params;
    const response = await fetch(`https://api.github.com/users/${username}`);
    const data = await response.json();
    const repos = data.public_repos;

    // Feed data to Redis
    client.setex(username, 3600, repos);
    res.send(setResponse(username, repos));
  }
  catch (err) {
    console.error(err);
    res.status(500);
  }
}

// Cache middleware
function cache(req, res, next) {
  const { username } = req.params;

  client.get(username, (err, data) => {
    if (err) throw err;
    if (data !== null) {
      res.send(setResponse(username, data));
    } else {
      next();
    }
  });
}

app.get('/repos/:username', cache, getRepos);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
