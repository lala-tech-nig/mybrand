# my Brand - Quick Start Guide

## Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)

## Setup

### 1. Backend
```bash
cd server
npm install
# Edit .env if needed (MongoDB URI, JWT secret)
npm run dev
```
✅ Server runs on **http://localhost:5000**

### 2. Frontend
```bash
cd client
npm install
npm run dev
```
✅ Frontend runs on **http://localhost:3000**

## Testing
1. Visit http://localhost:3000
2. Click "Get Started" to register a brand
3. View your brand at http://localhost:3000/[your-subdomain]
4. Test WhatsApp "Buy" button integration

## Next Steps
- Connect frontend forms to backend API
- Add image upload (Cloudinary/AWS S3)
- Implement Socket.io client for real-time updates
