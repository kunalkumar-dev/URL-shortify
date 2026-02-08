-- Database Schema for URL Shortify

-- Users Collection
db.createCollection("users");
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

-- Sample User document structure
/*
{
  _id: ObjectId(),
  username: "john_doe",
  email: "john@example.com",
  password: "hashed_password",
  createdAt: ISODate("2024-02-08T10:00:00Z")
}
*/

-- URLs Collection
db.createCollection("urls");
db.urls.createIndex({ shortId: 1 }, { unique: true });
db.urls.createIndex({ userId: 1 });
db.urls.createIndex({ createdAt: 1 });
db.urls.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

-- Sample URL document structure
/*
{
  _id: ObjectId(),
  originalUrl: "https://www.example.com/very/long/url",
  shortId: "abc123",
  userId: ObjectId("..."),
  clicks: 42,
  createdAt: ISODate("2024-02-08T10:00:00Z"),
  expiresAt: null
}
*/
