const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [ { id: 1, username: 'testuser', password: 'test1234' },  { id: 2, username: 'bob', password: 'password2' },];

const jwtSecret = '244d0b97c61cb978567e348a15fc8cd5c3c5791af982ccae88db48383bc3c273';

const isValid = (username)=>{ 
  const user = users.find((user) => user.username === username);
  return user ? true : false;
}

const authenticatedUser = (username,password)=>{ 
  const user = users.find((user) => user.username === username && user.password === password);
  return user ? true : false;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
      return res.status(400).json({ message: "Please provide username and password" });
  }
  const user = users.find((user) => user.username === username && user.password === password);
  // Check if username and password match
  if (user) {
      const accessToken = jwt.sign({ username, userPassword: password }, jwtSecret, { expiresIn: '1h' });

      // Store the access token in the session
      req.session.accessToken = accessToken;

      return res.status(200).json({ message: 'Login successful', accessToken });
  } else {
      return res.status(401).json({ message: 'Invalid username or password' });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review; 
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const username = decoded.username;

    const book = Object.values(books).find(book => book.isbn === isbn);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!book.reviews) {
      book.reviews = {};
    }

    book.reviews[username] = review;
    res.status(200).json({ message: "Review added/updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const username = decoded.username;

    if (!isValid(username)) {
      return res.status(404).json({ message: "User not found" });
    }

    const book = books[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.reviews && book.reviews[username]) {
      delete book.reviews[username]; // Видаляємо рев'ю цього користувача
      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      return res.status(404).json({ message: "Review not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
