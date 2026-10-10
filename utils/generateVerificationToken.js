const crypto = require("crypto");

const generateVerificationToken = () => {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  const hashedVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  return {
    verificationToken,
    hashedVerificationToken,
  };
};

module.exports = generateVerificationToken;
