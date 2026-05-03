# Prep Plus Test Series

## Setup
1. Clone the repository.
2. Run `npm install` in the root directory and the `frontend` directory.
3. Create a `.env` file in the root directory with the following variables:

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379 
# (Optional, set to enable Redis caching. If not set, caching is disabled)
```

## Running the App
1. Start the backend: `npm run dev` (in the root folder)
2. Start the frontend: `cd frontend` then `npm run dev`
