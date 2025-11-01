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

```env
FINNHUB_API_KEY=your_finnhub_key
API_NINJAS_KEY=your_api_ninjas_key
NEWSDATA_KEY=your_newsdata_key
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### API Keys Setup

1. **Finnhub API** (https://finnhub.io/)
   - Sign up for free account
   - Get API key from dashboard
   - Used for: Stock prices, market trends, best stocks, popular stocks

2. **API Ninjas** (https://api-ninjas.com/)
   - Sign up for free account
   - Get API key from account settings
   - Used for: Financial tips and quotes

3. **NewsData.io** (https://newsdata.io/)
   - Sign up for free account (100 requests/day)
   - Get API key from dashboard
   - Used for: Finance-related news articles

## API Endpoints

### Auth
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Transactions
- GET `/api/transactions` - Get all transactions (with filters)
- POST `/api/transactions` - Create transaction
- PUT `/api/transactions/:id` - Update transaction
- DELETE `/api/transactions/:id` - Delete transaction
- GET `/api/transactions/summary/stats` - Get summary statistics

### Assets
- GET `/api/assets` - Get all assets
- POST `/api/assets` - Create asset
- PUT `/api/assets/:id` - Update asset
- DELETE `/api/assets/:id` - Delete asset
- GET `/api/assets/analysis` - Get financial analysis

### External APIs (Finnhub, API Ninjas, NewsData.io)
- GET `/api/external/market/quote?symbol=AAPL` - Get stock quote
- GET `/api/external/market/gainers` - Get top gaining stocks
- GET `/api/external/market/popular` - Get popular stocks
- GET `/api/external/market/trends` - Get market indices (S&P 500, NASDAQ, etc.)
- GET `/api/external/market/rates` - Get exchange rates
- GET `/api/external/advice` - Get financial tips (API Ninjas)
- GET `/api/external/news?category=finance` - Get finance news (NewsData.io)
