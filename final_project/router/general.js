const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { password,username } = req.body;
  //check value of username and password
  if (!password || !username) {
    return res
      .status(401)
      .json({ message: "Please all fields must not be empty" });
  }
  if (isValid(username)) {
    return res.status(409).send({ message: "User already exists" }); // Conflict
  }

  users.push({ password,username });
  return res
    .status(200)
    .json({ message: `User ${username} Successfully registered` });
});

// @Description Get the book list available in the shop
//
public_users.get("/", async function (req, res) {
  let _books = [];
  try {
    await Object.keys(books).forEach((key) => {
      let book = {};
      book[key] = books[key];
      _books.push(book);
    });
    return res.status(200).json(_books);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  //console.log(_books);
});


// @Description Get book details based on ISBN
//
public_users.get("/isbn/:isbn", function (req, res) {
  const { isbn } = req.params;
  new Promise((resolve, reject) => {
    try {
      let data = {};
      data[isbn] = books[parseInt(isbn)];
      resolve(data);
    } catch (error) {
      //console.log(error.message);
      reject(error.message);
    }
  })
    .then((response) => {
      console.log(response);
      if (typeof response[isbn] !== "undefined") {
        return res.status(200).json(response);
      } else {
        return res.status(400).json({
          message: `The book with isbn ${isbn} not found !`,
        });
      }
    })
    .catch((error) => res.status(500).json(error));
});

// @Description Get book details based on author
//
public_users.get("/author/:author", async function (req, res) {
  const author = req.params.author;
  let lstbook = []; 
  //Write your code here
  try {
    Object.keys(books).forEach((key) => {
      if (books[key].author === author) {
        let book = {}
        book[key] = books[key]
        lstbook.push(book)
      }
    });

    if (lstbook.length > 0) {
      return res.status(200).json(lstbook);
    } else {
      return res.status(400).json({ message: `books not found !` });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message || error });
  }
});

// @Description Get all books based on title
//
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  let lstbook = []; 
  new Promise(function (resolve, reject) {
    try {
      //const book = Object.values(books).filter((e) => e.title === title);
      Object.keys(books).forEach((key) => {
        if (books[key].title === title) {
          let book = {}
          book[key] = books[key]
          lstbook.push(book)
        }
      });
      resolve(lstbook);
    } catch (error) {
      reject(error);
    }
  })
    .then((response) => {
      if (response.length > 0) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json({ message: `books not found !` });
      }
    })
    .catch((error) => res.status(500).json({ error: error.message || error }));
  //Write your code here
});

// @Description  Get book review
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  let myPromise = new Promise((resolve, reject) => {
    try {
      const book = books[parseInt(isbn)];
      resolve(book);
    } catch (error) {
      //console.log(error.message);
      reject(error.message);
    }
  });

  myPromise.then((response) => {
    if (response) {
      return res.status(200).json(response.reviews);
    } else {
      return res.status(400).json({
        message: `The book with isbn ${isbn} not found !`,
      });
    }
  });
  myPromise.catch((error) => res.status(500).json(error));
});

module.exports.general = public_users;
