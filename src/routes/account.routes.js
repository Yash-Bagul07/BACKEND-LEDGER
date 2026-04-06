const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const accountController = require('../controllers/account.controller')
 

const router = express.Router()

/**
 * - POST /api/accounts
 * - Create a new account
 * - Private/Protected Route
 */
console.log("middleware:", typeof someMiddleware);
console.log("controller:", typeof accountController.createAccountController);
router.post('/', authMiddleware.authMiddleware, accountController.createAccountController)


/** GET /api/accounts
 * - Get all accounts for the authenticated user
 * - Private/Protected Route
 */
router.get('/', authMiddleware.authMiddleware, accountController.getAccountsController)

/** GET /api/accounts/balance/:accountId
 * - Get a specific account by ID
 * - Private/Protected Route
 */
router.get('/balance/:accountId', authMiddleware.authMiddleware, accountController.getAccountBalanceController)


module.exports = router;