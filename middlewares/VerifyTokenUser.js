import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  let token = req.cookies?.token; // 1️⃣ try cookie

  // 2️⃣ if cookie not present, try Authorization header
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_USER_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};


