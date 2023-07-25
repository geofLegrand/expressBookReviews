const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;


const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){

    if (!req.session.authorization) return res.status(401).json({message:"You are not authorized"});
    try {
        jwt.verify(req.session.authorization,"Ngad$$admins",function(err,username){
            if (err)  return res.status(403).send({ message: "Forbidden !" });
            req.session.payload = username;
            next()
        });
    } catch (error) {
        return res.status(500).json({message:error})
    }

});
 
const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running on port " + PORT));
