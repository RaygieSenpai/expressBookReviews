const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

public_users.post("/register", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  if (username && password) {
    if (isValid(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(400).json({ message: "User already exists!" });
    }
  }
  return res.status(400).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  //Write your code here
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  let isbn = req.params.isbn;
  let book = books[isbn];
  if (book) return res.status(200).send(JSON.stringify(book));
  //Write your code here
  return res.status(200).json(book);
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  let author = req.params.author;
  let filteredBooks = Object.values(books).filter(
    (book) => book.author === author
  );
  if (filteredBooks.length > 0)
    return res.status(200).send(JSON.stringify(filteredBooks));
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  let title = req.params.title;
  let filteredBooks = Object.values(books).filter(
    (book) => book.title === title
  );
  if (filteredBooks.length > 0)
    return res.status(200).send(JSON.stringify(filteredBooks));
  return res.status(300).json({ message: "Yet to be implemented" });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  let isbn = req.params.isbn;
  let book = books[isbn];
  if (book) return res.status(200).send(JSON.stringify(book.reviews));
  //Write your code here
 return res.status(300).json({ message: "Yet to be implemented" });
});
public_users.get("/async/books", async function (req, res) {
  try {
    const response = await axios.get("http://localhost:5000/");
    return res.status(200).json(response.data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching book list", error: error.message });
  }
});
public_users.get("/async/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);

    return res.status(200).send(JSON.stringify(response.data, null, 2));
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching book details",
      error: error.message,
    });
  }
});
public_users.get("/async/:author", async (req, res) => {
  const author = req.params.author;

  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);

    return res.status(200).send(JSON.stringify(response.data, null, 2));
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching book details",
      error: error.message,
    });
  }
});
public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title;

  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);

    return res.status(200).send(JSON.stringify(response.data, null, 2));
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching book details",
      error: error.message,
    });
  }
});

module.exports.general = public_users;
