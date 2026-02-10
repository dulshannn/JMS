import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (Bearer <token>)
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (exclude password)
      // Note: We use 'await' here to ensure user data is ready
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ success: false, error: "User not found" });
      }

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      res.status(401).json({ success: false, error: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ success: false, error: "Not authorized, no token" });
  }
};