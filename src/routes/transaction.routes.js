const { Router } = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const transactionController = require("../controllers/transaction.controller")

const transactionRoutes = Router();

/**
 * - POST /api/transactions/
 * - Create a new transaction
 */

transactionRoutes.post("/", authMiddleware.authMiddleware, transactionController.createTransaction)


/** POST /api/transactions/system/initial-funds
 * - Create a new transaction to add initial funds to a user's account
 * - Private/Protected Route, only accessible by system users
*/
transactionRoutes.post("/system/initial-funds", authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction)

module.exports = transactionRoutes;