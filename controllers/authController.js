// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const db = require('../config/database');
// const { JWT_SECRET, JWT_EXPIRATION } = require('../config/jwt');
// const { validateRegister, validateLogin } = require('../utils/validation');

// exports.register = (req, res) => {
//   const { username, password } = req.body;
  
//   // Validate input
// //   const validationError = validateRegister(username, password);
// //   if (validationError) {
// //     return res.status(400).json({ error: validationError });
// //   }

//   // Check if user exists
//   db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
//     if (err) {
//       return res.status(500).json({ error: 'Database error' });
//     }
    
//     if (user) {
//       return res.status(400).json({ error: 'Username already exists' });
//     }

//     // Hash password
//     try {
//       const hashedPassword = await bcrypt.hash(password, 10);

//       // Insert new user
//       db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
//         [username, hashedPassword], 
//         function(err) {
//           if (err) {
//             return res.status(500).json({ error: 'Registration failed' });
//           }

//           const token = jwt.sign({ id: this.lastID }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
//           res.status(201).json({ token, userId: this.lastID });
//         }
//       );
//     } catch (error) {
//       res.status(500).json({ error: 'Server error' });
//     }
//   });
// };

// exports.login = (req, res) => {
//   const { username, password } = req.body;
  
//   // Validate input
//   const validationError = validateLogin(username, password);
//   if (validationError) {
//     return res.status(400).json({ error: validationError });
//   }

//   db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
//     if (err) {
//       return res.status(500).json({ error: 'Database error' });
//     }
    
//     if (!user) {
//       return res.status(400).json({ error: 'Invalid credentials' });
//     }

//     try {
//       const isMatch = await bcrypt.compare(password, user.password);
      
//       if (!isMatch) {
//         return res.status(400).json({ error: 'Invalid credentials' });
//       }

//       const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
//       res.json({ token, userId: user.id });
//     } catch (error) {
//       res.status(500).json({ error: 'Server error' });
//     }
//   });
// };
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { JWT_SECRET, JWT_EXPIRATION } = require('../config/jwt');

exports.register = (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required',
        success: false
      });
    }

    if (username.length < 3) {
      return res.status(400).json({ 
        error: 'Username must be at least 3 characters long',
        success: false
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long',
        success: false
      });
    }

    // Check if user exists
    const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
    
    db.get(checkUserQuery, [username], async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ 
          error: 'Database error',
          success: false
        });
      }
      
      if (existingUser) {
        return res.status(400).json({ 
          error: 'Username already exists',
          success: false
        });
      }

      // Hash password
      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
        
        db.run(insertQuery, [username, hashedPassword], function(insertErr) {
          if (insertErr) {
            return res.status(500).json({ 
              error: 'Registration failed',
              success: false
            });
          }

          const token = jwt.sign(
            { id: this.lastID, username }, 
            JWT_SECRET, 
            { expiresIn: JWT_EXPIRATION }
          );

          res.status(201).json({
            success: true,
            token,
            userId: this.lastID,
            username
          });
        });
      } catch (hashError) {
        res.status(500).json({ 
          error: 'Password hashing failed',
          success: false
        });
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error during registration',
      success: false
    });
  }
};

exports.login = (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required',
        success: false
      });
    }

    // Find user
    const findUserQuery = 'SELECT * FROM users WHERE username = ?';
    
    db.get(findUserQuery, [username], async (err, user) => {
      if (err) {
        return res.status(500).json({ 
          error: 'Database error',
          success: false
        });
      }
      
      if (!user) {
        return res.status(400).json({ 
          error: 'Invalid credentials',
          success: false
        });
      }

      // Compare passwords
      try {
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
          return res.status(400).json({ 
            error: 'Invalid credentials',
            success: false
          });
        }

        // Create token
        const token = jwt.sign(
          { id: user.id, username: user.username }, 
          JWT_SECRET, 
          { expiresIn: JWT_EXPIRATION }
        );

        res.json({
          success: true,
          token,
          userId: user.id,
          username: user.username
        });
      } catch (compareError) {
        res.status(500).json({ 
          error: 'Authentication failed',
          success: false
        });
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error during login',
      success: false
    });
  }
};