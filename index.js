const express = require('express');
const cors = require('cors');
const registerRouter = require('./routes/register.js');
const db = require('./db');
const PORT=process.env.PORT || 3000;
const helmet = require('helmet');
const auctionDetailsRouter = require('./routes/auction-details.js');
const endAuctionRouter = require('./routes/end-auction.js');
const createAuctionRouter = require('./routes/create-auction.js');
const loginRouter = require('./routes/login.js');
const forgotPasswordRouter = require('./routes/forgot-password.js');
const resetPasswordController = require('./controllers/reset-password.js');
const profile = require('./routes/profile.js');
const loginLimiter = require('./middleware/login_limiter.js');
const errorLogger = require('./middleware/error_logger.js');
const sellerDashboardRouter = require('./routes/seller-dashboard.js');
const adminDashboardRouter = require('./routes/admin-dashboard.js');
const placeBidRouter = require('./routes/place-bid.js');
const contactRouter = require('./routes/contact.js');
const app = express(); 

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,              
}));
app.use(helmet());
app.use(errorLogger);
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/register/buyer', registerRouter);
app.use('/register/seller', registerRouter);
app.use('/auction-details', auctionDetailsRouter);
app.use('/end/auctions', endAuctionRouter);
app.use('/auctions', createAuctionRouter);
app.use('/login', loginLimiter, loginRouter);
app.use('/forgot-password', forgotPasswordRouter);
app.use('/reset-password', resetPasswordController);
app.use('/', profile);
app.use('/seller', sellerDashboardRouter);
app.use('/admin', adminDashboardRouter);
app.use('/auctions', placeBidRouter);
app.use('/contact', contactRouter);
app.listen(PORT, () => {
  console.log(`Server Running on http://localhost:${PORT}`);
});



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});
