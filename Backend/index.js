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

app.get("/programmingbooks", async (req, res) => {
  const response = await db.query("select*from books where category =($1)", [
    "programming",
  ]);
  res.send(response.rows);
});

app.get("/inspiringbooks", async (req, res) => {
  const response = await db.query("select * from books");
  // console.log(response.rows);
  res.send(response.rows);
});

app.get("/autobiographybooks", async (req, res) => {
  const response = await db.query("select*from books where category =($1)", [
    "autobiography",
  ]);
  res.send(response.rows);
});

app.get("/sportsbooks", async (req, res) => {
  const response = await db.query("select*from books where category =($1)", [
    "sports",
  ]);
  res.send(response.rows);
});

app.post("/getborrowedbooks", async (req, res) => {
  console.log(req.body.user_id);

  const user_id = parseInt(req.body.user_id);
  // console.log(user_id);
  try {
    const response = await db.query(
      `Select * from borrowed_books where user_id=${user_id}`
    );
    console.log(response.rows);

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
    `select book_name from borrowed_books where book_name=$1 AND user_id=$2 `,
    [book_name, user_id]
  );
  console.log(response.rows);

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

app.get("/totalborrowedbooks", async (req, res) => {
  const response = await db.query("select * from borrowed_books");
  res.send(response.rows);
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

  await db.query(`update books set star_ratings=($1) where book_name= ($2)`, [
    req.body.rating,
    req.body.book_name,
  ]);
});

app.post("/favoriteinfo", async (req, res) => {
  console.log(req.body);
  await db.query(`update books set isfavourite=($1) where book_name=($2)`, [
    req.body.isFavorite,
    req.body.bookName,
    


  ]);
});

app.get("/getfavoritebooks", async (req, res) => {
  const response = await db.query(
    `select * from books where isfavourite='true'`
  );
  console.log(response.rows);
  res.send(response.rows);
});

app.get("/getuserinfo", async (req, res) => {
  const response = await db.query("select * from user_info");
  res.send(response.rows);
});

app.post("/addbooks", async (req, res) => {
  console.log(req.body);
  const { book_name } = req.body;
  const { book_author } = req.body;
  const { book_image } = req.body;
  const { book_description } = req.body;
  const { category } = req.body;

  await db.query(
    `Insert into books (book_name,book_author,book_image,book_description,category) values($1,$2,$3,$4,$5) `,
    [book_name, book_author, book_image, book_description, category]
  );
});

app.get("/getreviews", async (req, res) => {
  const response = await db.query(`select * from book_reviews`);
  res.send(response.rows);
});

app.post("/reviews", async (req, res) => {
  const { book_id } = req.body;
  const { review_headline } = req.body;
  const { review_description } = req.body;
  const { username } = req.body;
  try {
    await db.query(
      `Insert into book_reviews(book_id,review_headline,review_description,username) values($1,$2,$3,$4)`,
      [book_id, review_headline, review_description, username]
    );
  } catch (error) {
    res.send("User can only write one book review for a particular book");
  }
});

app.get("/admin-userinfo", async (req, res) => {
  const response = await db.query(
    `select user_info.username ,borrowed_books.book_id,borrowed_books.book_name,borrowed_books.book_author,borrowed_books.book_image,borrowed_books.book_description,borrowed_books.user_id,borrowed_books.returnon  from borrowed_books inner join user_info ON borrowed_books.user_id=user_info.Id`
  );
  res.send(response.rows);
});

app.post("/removefromborrowedbooks", async (req, res) => {
  const book_id = req.body.book_id;
  const user_id = req.body.user_id;

  await db.query(
    `delete from borrowed_books where book_id=($1) and user_id=($2)`,
    [book_id, user_id]
  );
  res.send("Book Removed Successfully!");
});

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
