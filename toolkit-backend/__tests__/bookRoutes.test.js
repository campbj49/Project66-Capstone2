const request = require("supertest");

const app = require("../app");
const db = require("../db");
const Book = require("../models/book");
process.env.NODE_ENV = "test";

//modified Auth Test Routes from last project to support book tests
describe("Book Routes Test", function () {

  beforeEach(async function () {
    await db.query("DELETE FROM books");
    
    let b1 = await Book.create({
      "isbn": "0691161510",
      "amazon_url": "http://a.co/test",
      "author": "test author",
      "language": "test lang",
      "pages": 264,
      "publisher": "Test Press",
      "title": "Test Title",
      "year": 2017
    });
  });

  /** GET /books => {list of books} */

  describe("GET /books", function(){
    test("can get book list", async function(){
      let response = await request(app).get("/books");
      let bookList = response.body.books;
      expect(bookList.length).toEqual(1);
      expect(bookList[0].isbn).toEqual("0691161510");
    });
  });

  /** GET /books/:isbn => {ISBN's details} */

  describe("GET /books/:isbn", function(){
    test("can get book details", async function(){
      let response = await request(app).get("/books/0691161510");
      let book = response.body.book;
      expect(book.isbn).toEqual("0691161510");
    });
  });

  /** POST /book => bookData */

  describe("POST /books", function () {
    test("can add a new book", async function () {
      let response = await request(app)
        .post("/books")
        .send({
          "isbn": "0691161518",
          "amazon_url": "http://a.co/eobPtX2",
          "author": "Matthew Lane",
          "language": "english",
          "pages": 264,
          "publisher": "Princeton University Press",
          "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
          "year": 2017
        });

      let newBook = response.body.book;
      expect(newBook).toEqual({
          isbn: "0691161518",
          amazon_url: "http://a.co/eobPtX2",
          author: "Matthew Lane",
          language: "english",
          pages: 264,
          publisher: "Princeton University Press",
          title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
          year: 2017
      });
    });

    test("will throw descriptive errors", async function () {
      let response = await request(app)
        .post("/books")
        .send({
          "amazon_url": "http://a.co/eobPtX2",
          "author": "Matthew Lane",
          "language": "english",
          "pages": 264,
          "publisher": "Princeton University Press",
          "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
          "year": 2017
        });

      let error = response.body.error;
      expect(error).toEqual({
        "message": [
            "instance requires property \"isbn\""
        ],
        "status": 400
    });
    });
  });

  /** PUT books/:isbn => {updated book} */

  describe("PUT /books/:isbn", function () {
    test("can update an existing book", async function () {
      let response = await request(app)
        .put("/books/0691161510")
        .send({
          "isbn": "0691161510",
          "amazon_url": "http://a.co/eobPtX2",
          "author": "Matthew Lane",
          "language": "english",
          "pages": 264,
          "publisher": "Princeton University Press",
          "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
          "year": 2017
        });

      let newBook = response.body.book;
      expect(newBook).toEqual({
          isbn: "0691161510",
          amazon_url: "http://a.co/eobPtX2",
          author: "Matthew Lane",
          language: "english",
          pages: 264,
          publisher: "Princeton University Press",
          title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
          year: 2017
      });
    });

    test("will throw descriptive errors", async function () {
      let response = await request(app)
        .put("/books/0691161510")
        .send({
          "isbn": "0691161510",
          "amazon_url": "http://a.co/eobPtX2",
          "language": "english",
          "pages": 264,
          "publisher": "Princeton University Press",
          "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
          "year": 2017
        });

      let error = response.body.error;
      expect(error).toEqual({
        "message": [
            "instance requires property \"author\""
        ],
        "status": 400
    });
    });
  });

  /** DELETE /books/:isbn => {Book deleted} */

  describe("DELETE /books/:isbn", function(){
    test("can delete book", async function(){
      let response = await request(app).delete("/books/0691161510");
      let message = response.body.message;
      expect(message).toEqual("Book deleted");
    });
  });
});

afterAll(async function () {
  await db.end();
});
