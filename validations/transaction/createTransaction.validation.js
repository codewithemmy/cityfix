const createTransactionValidation = {
  amount: {
    notEmpty: true,
    errorMessage: "amount name cannot be empty",
  },
  email: {
    notEmpty: true,
    errorMessage: "email cannot be empty",
  },
}

module.exports = { createTransactionValidation }
