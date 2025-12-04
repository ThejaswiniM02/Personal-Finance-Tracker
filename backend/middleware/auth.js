// middleware/auth.js
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization"); // may be undefined

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  // Support both "Bearer <token>" and just "<token>"
  const parts = authHeader.split(" ");
  const token = parts.length === 2 ? parts[1] : parts[0];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains { id: ... }
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token." });
  }
};

export default authMiddleware;

