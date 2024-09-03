const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const e = require("express");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let usernameWithSameName = users.filter((user) => {
    return user.username === username;
  });
  if (usernameWithSameName.length > 0) {
    return false;
  } else {
    return true;
  }
};

const authenticatedUser = (username, password) => {
  let authenticatedUser = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (authenticatedUser.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res
      .status(404)
      .json({ error: "Unable to login. Username or Password is missing" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, "access", {
      expiresIn: 60 * 60,
    });
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Username or Password is incorect" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  const review = req.body.review;
  const username = req.session.authorization.username;
  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }
  books[isbn].reviews[username] = review;
  res.json(book.reviews);
});

//Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  const username = req.session.authorization.username;
  if (!book) {
    return res.status(404).json({ error: "Book not found" });
  }

  if (book.reviews[username]) {
    //chỉ xóa khi có đánh giá của người dùng theo isbn
    delete book.reviews[username];
    res.json(book.reviews);
  } else {
    // Nếu đánh giá không tồn tại
    res.status(403).json({ error: "Review not found for this user" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
