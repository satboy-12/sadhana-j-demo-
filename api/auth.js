module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.demo_token",
    tokenType: "Bearer",
    userId: 1,
    username: "demo_user",
    email: "demo@herhealth.com",
    firstName: "Sophia",
    lastName: "Jenkins"
  });
};
