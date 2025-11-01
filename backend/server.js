require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const txRoutes = require('./routes/transactionRoutes');
const apiRoutes = require('./routes/apiRoutes');
const seedRoutes = require('./routes/seedRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

// Connect DB
connectDB(process.env.MONGO_URI);

app.get('/', (req, res) => res.send('Finance Management API running'));

app.use('/api/auth', authRoutes);
app.use('/api/transactions', txRoutes);
app.use('/api/external', apiRoutes);

// Dev-only seed endpoint
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/seed', seedRoutes);
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));