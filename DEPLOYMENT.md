# Deployment — Render + MongoDB Atlas

This guide prepares and deploys the project to Render (static frontend + Node backend) and uses MongoDB Atlas for the database.

1) Create a MongoDB Atlas cluster
   - Sign up at https://www.mongodb.com/cloud/atlas
   - Create a free cluster, create a database user and IP whitelist (0.0.0.0/0 for quick testing).
   - Obtain the connection string and replace `<username>`/`<password>` and database name.

2) Set environment variables
   - In Render, when creating the backend service, set `MONGODB_URI` to your Atlas connection string.
   - Set `API_BASE_URL` to your production API URL (e.g. `https://api.your-domain.com/api`) or leave as `/api` if frontend and backend are same origin.
   - Set `FRONTEND_URL` to your site URL and `JWT_SECRET` if using authentication.

3) Deploy on Render
   - In Render dashboard choose "New" → "Web Service" and connect your GitHub repo (or import existing).
   - For the backend, select `Node`, branch `main`, `Build Command`: `npm install`, `Start Command`: `npm start`.
   - Create a second service: "Static Site", point `Publish Directory` to the `frontend` folder.
   - Alternatively, use the provided `render.yaml` to create both services from the repo.

4) Domain and HTTPS
   - Add a custom domain in Render for each service (or use the static site URL for frontend and a subdomain for API).
   - Render provides automatic HTTPS via Let's Encrypt.

5) Verify
   - Visit the frontend URL and confirm requests to `/api` reach the backend.
   - Run smoke tests or the `test-features.js` script against your deployed API (update `API_BASE` in the test script if necessary).

6) Notes and tips
   - Use `process.env.API_BASE_URL` in the backend if you need fully-qualified URLs in emails or shareable links.
   - For one-service deployments, you can serve the built frontend from the backend (copy `frontend` into `public` and use `express.static`).
   - Keep secrets out of the repo; use Render's Environment settings.
