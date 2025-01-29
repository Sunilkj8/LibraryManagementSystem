import axios from "axios";
import pg from "pg";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
const app = express();
app.use(cors());
app.use(express.json());

const port = 3001;
app.use(bodyParser.urlencoded({ extended: true }));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "library management db",
  password: "grazie",
  port: "5432",
});

db.connect();

app.get("/", async (req, res) => {
  const response = await db.query("select * from kids_books");
  // console.log(response.rows);
  res.send(response.rows);
});

app.get("/featuredbooks", async (req, res) => {
  const response = await db.query("select * from featured_books");
  // console.log(response.rows);

  res.send(response.rows);
});

app.get("/fictionalbooks", async (req, res) => {
  const response = await db.query("select*from books where category =($1)", [
    "fictional",
  ]);
  // console.log(response.rows);
  res.send(response.rows);
});

app.get("/selfhelpbooks", async (req, res) => {
  const response = await db.query("select*from books where category =($1)", [
    "selfhelp",
  ]); // console.log(response.rows);
  res.send(response.rows);
});

app.get("/inspiringbooks", async (req, res) => {
  const response = await db.query("select * from books");
  // console.log(response.rows);
  res.send(response.rows);
});

app.post("/getborrowedbooks", async (req, res) => {
  const user_id = parseInt(req.body.user_id);
  // console.log(user_id);
  try {
    const response = await db.query(
      `Select * from borrowed_books where user_id=${user_id}`
    );
    res.send(response.rows);
  } catch (error) {
    console.log("User Logged Out!");
  }

  // console.log(response.rows);
});

app.post("/borrowedbooks", async (req, res) => {
  const selectedBook = req.body.selectedBook;
  const user_id = req.body.user_id;
  const book_name = selectedBook.book_name.toString();
  const book_author = selectedBook.book_author.toString();
  const book_image = selectedBook.book_image.toString();
  const book_description = selectedBook.book_description.toString();
  const returnon = req.body.returnVal.toString();
  // console.log(typeof book_name);
  // console.log(req.body);

  const response = await db.query(
    `select book_name from borrowed_books where book_name=$1 `,
    [book_name]
  );
  // console.log(response.rows);

  if (response.rows.length == 0) {
    await db.query(
      "Insert into borrowed_books(book_name, book_author, book_image, book_description, user_id,returnon) values($1,$2,$3,$4,$5,$6)",
      [book_name, book_author, book_image, book_description, user_id, returnon]
    );
    res.send("Book Borrowed Successfully!");
  } else {
    res.send("The Book Is Already Borrowed");
  }
});

app.get("/authorinfo", async (req, res) => {
  const response = await db.query(
    `SELECT book_name,author_image, author_name, category,book_image,book_description
     FROM books
     INNER JOIN authors_info ON books.book_author = authors_info.author_name; `
  );

  res.send(response.rows);
});

app.post("/ratinginfo", async (req, res) => {
  console.log(req.body);
  const res1 = "sdfsd";

  await db.query(`update books set star_ratings=($1) where book_name= ($2)`, [
    req.body.rating,
    req.body.book_name,
  ]);
});

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
