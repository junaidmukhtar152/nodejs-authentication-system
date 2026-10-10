const crypto = require("crypto");

const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  return {
    resetToken,
    hashedResetToken,
  };
};

module.exports = generateResetToken;
