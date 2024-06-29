
 const isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
      console.log(req.originalUrl);
      req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be LoggedIn to create place!!!");
        res.redirect("/login");
      }
      next();
}

module.exports = isLoggedIn;

module.exports.saveRedirectUrl = (req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};