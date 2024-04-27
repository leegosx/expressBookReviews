const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
  const {username, password } = req.body;
  if (!username ||!password) {
    return res.status(400).json({ message: "Please provide username and password" });
  }
  const user = users.find((user) => user.username === username);
  if (user) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ username, password });
  res.status(200).send({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving books", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/async/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`${API_URL}/isbn/${isbn}`);
    if (response.data) {
      res.status(200).json(response.data);
    } else {
      res.status(404).send("Book with ISBN " + isbn + " not found.");
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving book details", error: error.message });
  }
});
  
// Get book details based on author
public_users.get('/async/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const response = await axios.get(`${API_URL}/author/${author}`);
    if (response.data.length > 0) {
      res.status(200).json(response.data);
    } else {
      res.status(404).json({ message: "No books found for author: " + author });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching books by author", error: error.message });
  }
});

// Get all books based on title
public_users.get('/async/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const response = await axios.get(`${API_URL}/title/${title}`);
    if (response.data.length > 0) {
      res.status(200).json(response.data);
    } else {
      res.status(404).json({ message: "No books found with title: " + title });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching books by title", error: error.message });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
    const bookReviews = Object.values(books).find(book => book.isbn === isbn);
    if (bookReviews) {
        res.status(200).send(bookReviews.reviews);
    } else {
        res.status(404).send({ message: "Book not found" });
    }
});

module.exports.general = public_users;
