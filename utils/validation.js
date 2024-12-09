const validateRegister = (username, password) => {
    if (!username || username.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    if (!password || password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };
  
  const validateLogin = (username, password) => {
    if (!username || !password) {
      return 'Username and password are required';
    }
    return null;
  };
  
  module.exports = {
    validateRegister,
    validateLogin
  };