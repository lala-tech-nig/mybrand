# my Brand - Backend API

## Overview
Node.js/Express backend with MongoDB, JWT authentication, and Socket.io for real-time features.

## Environment Variables
Create a `.env` file in the server directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mybrand
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:3000
```

## API Endpoints

### Authentication
**POST** `/api/auth/register`
```json
{
  "username": "brandname",
  "email": "email@example.com",
  "password": "password",
  "brandName": "My Brand",
  "whatsappNumber": "2348012345678"
}
```
Response: `{ token, brand: { id, username, brandName } }`

**POST** `/api/auth/login`
```json
{
  "email": "email@example.com",
  "password": "password"
}
```
Response: `{ token, brand: { id, username, brandName } }`

### Brands
**GET** `/api/brands/:username`
Returns brand profile, products, and posts.

### Products
**GET** `/api/products/brand/:brandId` - Get all products
**POST** `/api/products` (Protected) - Create product
**PUT** `/api/products/:id` (Protected) - Update product
**DELETE** `/api/products/:id` (Protected) - Delete product

### Posts
**GET** `/api/posts/brand/:brandId` - Get all posts
**POST** `/api/posts` (Protected) - Create post
**PUT** `/api/posts/:id/like` - Like/unlike post
**DELETE** `/api/posts/:id` (Protected) - Delete post

## Protected Routes
Include JWT token in header:
```
x-auth-token: <your-token>
```

## Socket.io Events

### Client to Server
- `join_brand(brandId)` - Join brand room
- `leave_brand(brandId)` - Leave brand room
- `typing({ brandId, username })` - Typing indicator
- `new_follower({ brandId, followerName })` - New follower notification

### Server to Client
- `new_product(product)` - New product created
- `new_post({ brandId, post })` - New post created
- `post_liked({ postId, likes })` - Post liked
- `follower_added({ followerName, timestamp })` - Follower added
- `user_typing({ username })` - User typing

## Running the Server
```bash
npm install
npm run dev  # Development with nodemon
npm start    # Production
```

Server runs on port 5000 (or PORT from .env)
