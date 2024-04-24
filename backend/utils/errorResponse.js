// Error Response Handlers

function forbid(res) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }
  

module.exports = {
    forbidden: forbid
};