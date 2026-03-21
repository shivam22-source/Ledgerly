
module.exports=(...allowedrole)=>{

return (req,res,next)=>{
    if(!allowedrole.includes(req.user.role)){
         res.status(403).json({
            message:"Not Permission"
        })
    }
    next();
}
}