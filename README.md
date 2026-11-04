# redisExample

This application demonstrates the use of Redis for caching data fetched from the GitHub API in a Node.js Express application.

## Application Overview

The application provides an endpoint to fetch and display GitHub user profile information. When a request is made for a specific username:

1.  The application first checks if the user's data is already cached in Redis.
2.  If found in Redis, the cached data is served immediately.
3.  If not found in Redis (or if the cache has expired), the application fetches the data from the GitHub API (`https://api.github.com/users/:username`).
4.  The fetched data is then stored in Redis with an expiration time of 100 seconds.
5.  Finally, the user's profile information is displayed to the client.

This caching mechanism helps to reduce the number of direct API calls to GitHub, improving response times for subsequent requests for the same user and minimizing rate-limiting issues.

## Data Fetched and Displayed

The application fetches and displays the following information for a GitHub user:

*   **Username (login)**: The user's GitHub login name.
*   **Name**: The user's display name.
*   **Bio**: The user's profile biography.
*   **Public Repositories**: The number of public repositories the user has.
*   **Followers**: The number of followers the user has.
*   **Following**: The number of users the user is following.

## Running the Application

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run the application:
    ```bash
    node index.js
    ```
    For development, you can use `nodemon index.js` as `nodemon` is listed in the project dependencies. You might need to install it globally (`npm install -g nodemon`) or run it via `npx nodemon index.js`.

The server will start on port 3000 (or the value of `process.env.PORT`).
Access the endpoint in your browser or using a tool like `curl`:
`http://localhost:3000/repos/:username` (e.g., `http://localhost:3000/repos/octocat`)

## Verification

Run `npm run verify` after installing dependencies. Read [.cursor/skills/verify-redisexample/SKILL.md](.cursor/skills/verify-redisexample/SKILL.md) for isolation, prerequisites, browser mode, proof locations, feature coverage and cleanup. Setup is not a claim of full feature or production verification.
