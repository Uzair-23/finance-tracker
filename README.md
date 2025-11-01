# Finance Management Tool — MERN

Full-stack finance management web app using the MERN stack (MongoDB, Express, React, Node.js).

## Features

- User register/login with JWT
- Transaction CRUD with filters
- Dashboard with Charts.js visualizations
- Live market data (Finnhub)
- Financial news (NewsData.io)
- Budget alerts and insights
- Currency conversion

## Setup & Run

### 1. Backend

```powershell
cd .\backend
npm install
# Create .env from .env.example and set your keys
npm run dev
```

### 2. Frontend

```powershell
cd .\frontend
npm install
npm run dev
```

### 3. Test Account

Visit http://localhost:5000/api/seed to create a demo account:

- Email: demo@demo.com
- Password: password

## Environment Variables

Create `.env` in backend folder with:

```
FINNHUB_API_KEY=your_finnhub_key
API_NINJAS_KEY=your_api_ninjas_key
NEWSDATA_KEY=your_newsdata_key
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

## API Endpoints

- Auth: POST /api/auth/register, /api/auth/login
- Transactions: GET/POST/PUT/DELETE /api/transactions
- External APIs: GET /api/external/market/quote, /rates, /news, /advice
