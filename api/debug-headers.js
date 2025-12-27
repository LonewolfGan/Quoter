module.exports = async (req, res) => {
  return res.status(200).json({
    headers: req.headers,
    authorization: req.headers.authorization,
    expected: `Bearer ${process.env.CRON_SECRET}`,
    match: req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`,
  });
};
```

Puis configure un cron job temporaire sur cette URL :
```;
