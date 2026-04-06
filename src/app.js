const express = require('express');
const cookieParser = require('cookie-parser');

/* Routers required*/
const authRouter = require('./routes/auth.routes');
const accountRouter = require('./routes/account.routes')
const transactionRoutes = require('./routes/transaction.routes')


const app = express();

app.use(cookieParser());
app.use(express.json());

/* use Routes */
app.use('/api/auth', authRouter);
app.use('/api/accounts', accountRouter);  
app.use('/api/transactions', transactionRoutes)  

module.exports = app;