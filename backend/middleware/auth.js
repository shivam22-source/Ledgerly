const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header)
    return res.status(401).json({ message: "Authorization header missing" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // { userId,role } //req.user.userID && req.user.role
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
