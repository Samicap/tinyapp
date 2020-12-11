const getUserByEmail = function(email, usersDatabase) {
  for (let key in usersDatabase) { // key = string index of users
    if (usersDatabase[key].email === email) {
      return usersDatabase[key];
    }
  }
};

module.exports = { getUserByEmail };

