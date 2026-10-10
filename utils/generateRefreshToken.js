const crypto = require("crypto");

const generateRefreshToken = () => {
  const refreshToken = crypto.randomBytes(32).toString("hex");

  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  return {
    refreshToken,
    hashedRefreshToken,
  };
};

module.exports = generateRefreshToken;
