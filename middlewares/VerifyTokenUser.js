export const authMiddleware = (req, res, next) => {
    console.log("Raw cookie header:", req.headers.cookie);
  console.log("Parsed cookies:", req.cookies);
  const token = req.cookies.token;

  console.log("Token from cookie:", token); // Debugging line

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
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};