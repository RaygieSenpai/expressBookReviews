const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

/**
 * Simulated DB fetch using axios + Promise
 * This creates a fake "API" call that resolves with the books data.
 */
async function fetchBooksFromDB() {
    return axios.get('https://fake-api/books', {
        // Instead of making a real HTTP call, we'll override axios' adapter to return a Promise
        adapter: async (config) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        data: books,
                        status: 200,
                        statusText: "OK",
                        headers: {},
                        config,
                    });
                }, 200);
            });
        },
    }).then(response => response.data);
}

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const books = await fetchBooksFromDB();
        res.send(JSON.stringify(books, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Error fetching books.", error: error.message });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const books = await fetchBooksFromDB();
        const book = books[isbn];
        if (book) {
            res.status(200).json(book);
        } else {
            res.status(404).json({ message: `Cannot found the book with ISBN ${isbn}` })
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching books.", error: error.message });
    }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const input_author = req.params.author;
    try {
        const books = await fetchBooksFromDB();
        const booksByAuthor = (Object.values(books)).filter((book) => book.author === input_author);

        if (booksByAuthor.length > 0) {
            res.status(200).json(booksByAuthor)
        } else {
            res.status(404).json({ message: `Do not found book written by ${input_author}.` })
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching books.", error: error.message });
    }

});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const books = await fetchBooksFromDB();
        const booksByTitle = (Object.values(books)).filter((book) => book.title == title);

        if (booksByTitle.length > 0) {
            res.status(200).json(booksByTitle)
        } else {
            res.status(404).json({ message: `Do not found book with title of ${title}.` })
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching books.", error: error.message });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        res.send(book.reviews)
    } else {
        res.send(`Do not found book with ISBN ${isbn}.`)
    }
});

module.exports.general = public_users;
