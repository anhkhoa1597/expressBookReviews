const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (isValid(username)) {
      // Add the new user to the users array
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ error: "User already exists!" });
    }
  }
  // Return error if username or password is missing
  return res.status(404).json({
    message: "Unable to register user. Username or Password is missing",
  });
});

//an end-point to fetch books
public_users.get("/mock-api/books", (req, res) => {
  res.json(books);
});

// Get the book list available in the shop using async/await with axios
public_users.get("/", async function (req, res) {
  try {
    const response = await axios.get("http://localhost:3333/mock-api/books");
    console.log("Success fetch book list");
    res.json(response.data);
  } catch (error) {
    console.log("Failed to fetch book list: " + error);
    res.status(500).json({ error: "Failed to fetch book list" });
  }
});

// Get book details based on ISBN using Promise with axios
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  axios
    .get("http://localhost:3333/mock-api/books")
    .then((response) => {
      console.log("Success fetch book list");
      const book = response.data[isbn];
      if (book) {
        res.json({ book });
      } else {
        res.status(404).json({ error: "Book not found" });
      }
    })
    .catch((error) => {
      console.log("Failed to fetch book list: " + error);
      res.status(500).json({ error: "Failed to fetch book list" });
    });
});

// Get book details based on author using Promise with axios
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author.toLocaleLowerCase();
  let booksByAuthor = {};

  axios
    .get("http://localhost:3333/mock-api/books")
    .then((response) => {
      console.log("Success fetch book list");
      for (let isbn in response.data) {
        if (response.data[isbn].author.toLowerCase() === author) {
          booksByAuthor[isbn] = response.data[isbn];
        }
      }

      if (Object.keys(booksByAuthor).length > 0) {
        res.json(booksByAuthor);
      } else {
        res.status(404).json({ error: "Book not found" });
      }
    })
    .catch((error) => {
      console.log("Failed to fetch book list: " + error);
      res.status(500).json({ error: "Failed to fetch book list" });
    });
});

// Get all books based on title using async/await with axios
public_users.get("/title/:title", async function (req, res) {
  const title = req.params.title.toLocaleLowerCase();
  let booksByTitle = {};

  try {
    const response = await axios.get("http://localhost:3333/mock-api/books");
    console.log("Success fetch book list");
    for (let isbn in response.data) {
      if (response.data[isbn].title.toLowerCase() === title) {
        booksByTitle[isbn] = response.data[isbn];
      }
    }
    if (Object.keys(booksByTitle).length > 0) {
      res.json(booksByTitle);
    } else {
      res.status(404).json({ error: "Book not found" });
    }
  } catch (error) {
    console.log("Failed to fetch book list: " + error);
    res.status(500).json({ error: "Failed to fetch book list" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.json({ reviews: book.reviews });
  } else {
    res.status(404).json({ error: "Book not found" });
  }
});

module.exports.general = public_users;
