const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  const user = users.find(
    (user) => user.username.toLowerCase() === ("" + username).toLowerCase()
  );
  if (user) return true;
  else return false;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  const user = users.find(
    (user) => user.username === username && user.password === password
  );
  if (user) return true;
  else return false;
};

// @Description add or update review
const addOrupdateBookReview = (reviews, username, review) => {
  const _reviews = Object.values(reviews);
  const _review = _reviews.find((review) => review.username === username);
  if (!_review) {
    reviews[_reviews.length + 1] = { username, review }; // add new review
  } else {
    Object.keys(reviews).forEach((key) => {
      if (reviews[key].username === username) {
        reviews[key].review = review; // update review
        return;
      }
    });
  }

  return reviews;
};
// @Description method for deleting a review of user account
const deleteBookReview = (reviews, username) => {
  Object.keys(reviews).forEach((key) => {
    if (reviews[key].username === username) {
      delete reviews[key]; // delete review
      return;
    }
  });
  return reviews;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const { username, password } = req.body;

  if (!password || !username) {
    return res
      .status(401)
      .json({ message: "Please all fields must not be empty" });
  }
  if (!authenticatedUser(username, password))
    return res
      .status(401)
      .json({ message: "User " + username + " does not exist" }); // Unauthorized

  let accessToken = jwt.sign({ username }, "Ngad$$admins", {
    expiresIn: 2 * 60 * 60, // 2hours
  });

  req.session.authorization = accessToken;

  return res
    .status(200)
    .json({ message: "User successfully authenticated !!" });
});

// Add a book review
// @Desc reviews skeletal
// {
//    1:{username:"John",review:"I have reviewed"},
//    2:{username:"Johnny",review:"good book"};
// }
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[parseInt(isbn)];
  let _book = {};
  if (!book)
    return res
      .status(404)
      .json({ message: `The book with isbn ${isbn} not found !` });

  book.reviews = addOrupdateBookReview(
    book.reviews,
    req.session.payload.username,
    req.query.review
  );
  _book[parseInt(isbn)] = book;
  res
    .status(201)
    .json({ message: `Review  added/updated successfully`, book: _book });
});

// @Desc detele a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.payload.username;
  const book = books[parseInt(isbn)];
  let _book = {};
  if (!book)
    return res
      .status(404)
      .json({ message: `The book with isbn ${isbn} not found !` });
  book.reviews = deleteBookReview(book.reviews, username);
  _book[parseInt(isbn)] = book;
  res
    .status(201)
    .json({ message: `Review  deleted successfully`, book: _book });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
