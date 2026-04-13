const ratelimit=require("express-rate-limit")
const Loginlimiter=ratelimit({
  windowMs:15*60*1000,///15 min
  max:10,
  message:{
    message:"Too many request try again after 15 min"
  }
})
  
 module.exports={Loginlimiter} ;