const { User } = require("../../models/user.model")

const loginUserValidation = {
  email: {
    notEmpty: true,
    errorMessage: "Email cannot be empty",
    isEmail: {
      errorMessage: "Invalid email address",
    },
    custom: {
      options: (v) => {
        return User.find({
          email: v,
        }).then((user) => {
          if (user.length > 0) {
            return Promise.reject("Email already in use")
          }
        })
      },
    },
  },
  password: {
    notEmpty: true,
    errorMessage: "Password cannot be empty",
  },
}

module.exports = { loginUserValidation }
