import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  
  const { authorization } = req.headers;
  
  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token required" });
  }

  const token = authorization.split("Bearer ")[1];
  try {
    const decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
