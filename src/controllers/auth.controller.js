const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service')
const tokenBlackListModel = require('../models/blacklist.model');

/** 
*-user registration controller
*-POST /api/auth/register 
*/ 
async function  userRegisterController(req, res){

    const {name, email, password} = req.body;

    const isExists = await userModel.findOne({
        email: email
    })

    if(isExists){
        return res.status(422).json({
            message : "User already exists with this email",
            status : "failed"
        })
    }

    const user = await userModel.create({
        name, email, password 
    })

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET,{expiresIn: '3d'})

    res.cookie('token',token)

    emailService.sendRegistrationEmail(user.name, user.email);

    return res.status(201).json({
        user :{
            _id : user._id,
            name : user.name,
            email : user.email
        },
        token
    })
    

}

/** 
*-user login controller
*-POST /api/auth/login 
*/ 
async function userLoginController(req,res){

    const {email, password} = req.body;

    const user = await userModel.findOne({email}).select('+password');

    if(!user){
        return res.status(401).json({
            message : "User not found with this email",
        })
    }

   const isValidPassword = await user.comparePassword(password);

   if(!isValidPassword){
    return res.status(401).json({
        message : "Invalid password",
    })
   }

   const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET,{expiresIn: '3d'})

   res.cookie('token', token)

   res.status(200).json({
    user : {
        _id : user._id,
        name : user.name,
        email : user.email
    },
    token
   })
}

/** POST /api/auth/logout */
async function userLogoutController(req, res) {
    const token = req.cookies.token ||req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(400).json({
            message: "User logged out successfully"
        });
    }

    res.cookie('token', ''); 

    await tokenBlackListModel.create({ token });

    res.status(200).json({
        message: "User logged out successfully"
    });
}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}