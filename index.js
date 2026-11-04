import express from 'express'
import fetch from 'node-fetch'
import redis from 'redis'

const PORT = process.env.PORT || 3000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient({
  socket: { host: '127.0.0.1', port: Number(REDIS_PORT) },
  enable_offline_queue: false,
  legacyMode: true
});
await client.connect();
const app = express();

// Create template for sending response to client
function sendData(userData) {
  return `
    <div>
      <h1>${userData.name || userData.login}</h1>
      ${userData.bio ? `<p>Bio: ${userData.bio}</p>` : ''}
      <p>Public Repositories: ${userData.public_repos}</p>
      <p>Followers: ${userData.followers}</p>
      <p>Following: ${userData.following}</p>
    </div>
  `;
}

// Get data from github
async function getRepos(req, res, next) {
  try {
    const { username } = req.params;
    const response = await fetch(`https://api.github.com/users/${username}`);
    const data = await response.json();

    // Construct userData object
    const userData = {
      login: username, // Add login field
      name: data.name,
      bio: data.bio,
      public_repos: data.public_repos,
      followers: data.followers,
      following: data.following,
    };

    // Feed data to Redis
    client.setEx(username, 100, JSON.stringify(userData));
    res.send(sendData(userData)); // Pass userData object to sendData
  }
  catch (err) {
    console.error(err);
    res.status(500);
  }
}

// Cache middleware
function cache(req, res, next) {
  const { username } = req.params;
  client.get(username, (err, data) => { // data is JSON string
    if (err) throw err;
    if (data !== null) {
      const userData = JSON.parse(data); // Parse JSON string to object
      res.send(sendData(userData)); // Pass userData object to sendData
    } else {
      next();
    }
  });
}

app.get('/repos/:username', cache, getRepos);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
