const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { logEvents } = require("../middleware/logger");

// @desc Login
// @route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    logEvents("Login failed: Missing username or password", "reqLog.log");
    return res.status(400).json({ message: "All fields are required" });
  }

  // Search for the user case-insensitively using regex
  const foundUser = await User.findOne({ 
    username: { $regex: new RegExp(`^${username}$`, "i") } 
  }).exec();

  if (!foundUser || !foundUser.isActive) {
    logEvents(
      `Login failed: Invalid user or inactive - ${username}`,
      "reqLog.log"
    );
    return res.status(401).json({ message: "Unauthorized" });
  }

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) {
    logEvents(`Login failed: Incorrect password - ${username}`, "reqLog.log");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        en_name: foundUser.en_name,
        ar_name: foundUser.ar_name,
        roles: foundUser.roles,
        userId: foundUser._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "8h" }
  );

  // Create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, // accessible only by web server
    secure: process.env.NODE_ENV === "production", // https
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // cross-site cookie in production, Lax in development
    maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expiry: set to match refresh token or longer
  });

  // logEvents(`User logged in: ${foundUser.username}`, "reqLog.log");

  // Send accessToken containing username and roles
  res.json({
    accessToken,
    user: {
      username: foundUser.username,
      en_name: foundUser.en_name,
      ar_name: foundUser.ar_name,
      roles: foundUser.roles,
    },
  });
});

// @desc Refresh
// @route GET /auth/refresh
// @access Public
const refresh = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    logEvents("Refresh failed: No JWT cookie", "reqLog.log");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) {
        logEvents("Refresh failed: Invalid refresh token", "reqLog.log");
        return res.status(403).json({ message: "Forbidden" });
      }

      const foundUser = await User.findOne({
        username: { $regex: new RegExp(`^${decoded.username}$`, "i") },
      }).exec();

      if (!foundUser || !foundUser.isActive) {
        logEvents(
          `Refresh failed: No active user found for token - ${decoded.username}`,
          "reqLog.log"
        );
        return res.status(401).json({ message: "Unauthorized" });
      }

      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            en_name: foundUser.en_name,
            ar_name: foundUser.ar_name,
            roles: foundUser.roles,
            userId: foundUser._id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      // logEvents(
      //   `Token refreshed for user: ${foundUser.username}`,
      //   "reqLog.log"
      // );

      res.json({
        accessToken,
        user: {
          username: foundUser.username,
          en_name: foundUser.en_name,
          ar_name: foundUser.ar_name,
          roles: foundUser.roles,
        },
      });
    })
  );
};

// @desc Logout
// @route POST /auth/logout
// @access Public
const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    logEvents("Logout: No JWT cookie present", "reqLog.log");
    return res.sendStatus(204); // No content
  }

  const refreshToken = cookies.jwt;

  // Optionally decode token to log who logged out
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    // logEvents(`User logged out: ${decoded.username}`, "reqLog.log");
  } catch (err) {
    logEvents("Logout: Failed to decode token or token expired", "reqLog.log");
  }

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Cookie cleared" });
};

module.exports = {
  login,
  refresh,
  logout,
};
