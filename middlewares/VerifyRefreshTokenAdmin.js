import jwt from "jsonwebtoken"

export const verifySuperAdminAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_ADMIN_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: "Token expired" });
    }

    if (decoded.role !== "SuperAdmin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    req.user = decoded;
    next();
  });
};


export const refreshSuperAdminToken = (req, res) => {
  const refreshToken = req.cookies.adminRefreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "No refresh token" });
  }

  jwt.verify(
    refreshToken,
    process.env.JWT_ADMIN_REFRESH_SECRET,
    (err, decoded) => {
      if (err) {
        return res.status(403).json({ success: false, message: "Invalid refresh token" });
      }

      const newAccessToken = jwt.sign(
        { email: decoded.email, role: decoded.role },
        process.env.JWT_ADMIN_ACCESS_SECRET,
        { expiresIn: "15m" }
      );

      res.status(200).json({
        success: true,
        accessToken: newAccessToken,
      });
    }
  );
};

