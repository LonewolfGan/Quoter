module.exports = async (req, res) => {
  const authHeader = req.headers.authorization || null;
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  return res.status(200).json({
    received: {
      authorization: authHeader,
      length: authHeader ? authHeader.length : 0,
      bytes: authHeader ? Buffer.from(authHeader).toString("hex") : null,
    },
    expected: {
      value: expected,
      length: expected.length,
      bytes: Buffer.from(expected).toString("hex"),
    },
    comparison: {
      match: authHeader === expected,
      cronSecretExists: !!process.env.CRON_SECRET,
      cronSecretValue: process.env.CRON_SECRET
        ? `${process.env.CRON_SECRET.substring(0, 10)}...`
        : "undefined",
    },
    allHeaders: req.headers,
  });
};
