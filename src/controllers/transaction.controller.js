const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const emailService = require('../services/email.service');
const mongoose = require('mongoose');






/**Create a new transaction */

async function createTransaction(req, res) {

        const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

        if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
             message: "Missing required fields: fromAccount, toAccount, amount, idempotencyKey"
             });
        } 

        const fromUserAccount = await accountModel.findOne({
            _id: fromAccount, 
        })

        const toUserAccount = await accountModel.findOne({
            _id: toAccount, 
        })

        if (!fromUserAccount || !toUserAccount) {
            return res.status(400).json({
                message: "Invalid fromAccount or toAccount"
            });
        }

        /** Check/Validate Idempotency Key */
      const isTranctionAlreadyExists = await transactionModel.findOne({
         idempotencyKey
         });

         if (isTranctionAlreadyExists) {
           if(isTranctionAlreadyExists.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already completed",
                transaction: isTranctionAlreadyExists
            })
            }
            if(isTranctionAlreadyExists.status === "PENDING") {
                return res.status(200).json({
                    message: "Transaction is pending",
                })
            }
            if(isTranctionAlreadyExists.status === "FAILED") {
                return res.status(500).json({
                    message: "Transaction has failed, please try again",
                })
            }
            if(isTranctionAlreadyExists.status === "REVERSED") {
                return res.status(200).json({
                    message: "Transaction has been reversed",
                })
            }
         }

        /** Create Account status */

        if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
            return res.status(400).json({
                message: "Both accounts must be active to perform a transaction"
            });
        }

        /** Check Sender's Balance from ledger */
        const balance = await fromUserAccount.getBalance(); 

        if (balance < amount) {
            return res.status(400).json({
                message: `Insufficient balance in the sender's account, Current balance is ${balance}, Requested amount is ${amount}`
            });
        }

        let transaction;
        try{

        
        

        /** Create Transaction */
        const session = await mongoose.startSession();
        session.startTransaction();

         transaction = await  transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], {session});

        const debitLedgerEntry = await ledgerModel.create({
            account: fromAccount,
            transaction: trannsaction._id,
            amount : amount, 
            type: "DEBIT"
        }, {session
    });
        await (()=>{
        return new Promise((resolve)=> setTimeout(resolve, 15* 1000));
    })()

        const creditLedgerEntry = await ledgerModel.create({
            account: toAccount,
            transaction: trannsaction._id,
            amount : amount, 
            type: "CREDIT"
        }, {session
    });

    await transactionModel.findOneAndUpdate(
        {_id: transaction._id},
        {status: "COMPLETED"},
        {session}
    )

    await session.commitTransaction();
    session.endSession();
        }catch(err){
            await transactionModel.findOneAndUpdate(
                {idempotencyKey: idempotencyKey},
                {status: "FAILED"}
            )
            return res.status(400).json({
                message: "Transaction is Pending , please try again if Failed",
                error: err.message
            })
        }


     /** Send Email Notification to the receiver */

   await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toUserAccount._id);

   return res.status(200).json({
    message: "Transaction completed successfully",
    transaction: transaction
   });
}

async function createInitialFundsTransaction(req, res){

     const { toAccount, amount, idempotencyKey } = req.body;

    const existingTransaction = await transactionModel.findOne({ idempotencyKey });

if (existingTransaction) {
    return res.status(200).json({
        message: "Transaction already processed",
        transaction: existingTransaction
    });
}

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
         message: "Missing required fields: toAccount, amount, idempotencyKey"
         });
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        });
    }

    const fromUserAccount = await accountModel.findOne({
        
        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        });
    }

    const session = await mongoose.startSession();
    mongoose.startSession();
    session.startTransaction(); 

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount: toUserAccount._id,
        amount,
        idempotencyKey,
        status: "PENDING"   
    });

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount : amount,
        type: "DEBIT",
        transaction: transaction._id,   
}], {session});

await (()=>{
    return new Promise((resolve)=> setTimeout(resolve, 100* 1000));
})()

    const creditLedgerEntry = await ledgerModel.create([{
    account: toUserAccount._id,
    amount : amount,
    type: "CREDIT",
    transaction: transaction._id,   
}], {session});

   transaction.status = "COMPLETED";
   await transaction.save({session});

   await session.commitTransaction();
   session.endSession();

   return res.status(201).json({
    message: "Initial funds transaction created successfully",
    transaction: transaction
   });

  

}

module.exports = {
    createTransaction,
    createInitialFundsTransaction
};