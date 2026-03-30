import jwt from "jsonwebtoken";
export const authMiddleware = (req, res, next) => {

  const token = req.cookies.token;

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
  }catch (err) {
  console.log("JWT verify error:", err);

  return res.status(401).json({
    success: false,
    message: "Invalid token",
  });
}
};


