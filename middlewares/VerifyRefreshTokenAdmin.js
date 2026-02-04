import jwt from "jsonwebtoken"

export const verifySuperAdminAccessToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing token",
      });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_ADMIN_ACCESS_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Token expired or invalid",
        });
      }

      // ✅ ONLY SuperAdmin allowed
      if (
        decoded.userType !== "SuperAdmin" ||
        decoded.isSuperAdmin !== true
      ) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      // attach data for controllers
      req.email = decoded.email;
      req.userType = decoded.userType;
      req.isSuperAdmin = decoded.isSuperAdmin;

      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



export const refreshSuperAdminToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.superAdminRefreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_ADMIN_REFRESH_SECRET,
      (err, decoded) => {
        if (err) {
          return res.status(403).json({
            success: false,
            message: "Invalid or expired refresh token",
          });
        }

        if (decoded.userType !== "SuperAdmin") {
          return res.status(403).json({
            success: false,
            message: "Forbidden",
          });
        }

        const newAccessToken = jwt.sign(
          {
            email: decoded.email,
            role: decoded.userType, // "SuperAdmin"
          },
          process.env.JWT_ADMIN_ACCESS_SECRET,
          { expiresIn: "15m" }
        );

        return res.status(200).json({
          success: true,
          accessToken: newAccessToken,
        });
      }
    );
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

