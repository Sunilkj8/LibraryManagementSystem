import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import axios from "axios";
import cors from "cors";
import pg from "pg";
const JWT_SECRET = "GGMUsuniljakhar";
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
// const users = [];

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "library management db",
  password: "grazie",
  port: 5432,
});
db.connect();

app.get("/", (req, res) => {
  // res.render("index.ejs");
  res.sendFile("/home/sunilj08/Documents/authentication/public/index.html");
});
// /signup means insert the new data into the db
app.post("/signup", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  await db.query(
    "INSERT INTO user_info(username,email,password) values($1,$2,$3)",
    [username, email, password]
  );

  console.log("Table after insertion:");
  const response = await db.query("Select * from user_info");
  console.log(response.rows); // Gives an array of objects containing the data

  res.send("You've been signed up");
});

app.post("/signin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  // console.log("signin credentials:");
  let foundUser = null;
  const response = await db.query("Select * from user_info");
  console.log(email + "   " + password);

  response.rows.forEach((elem) => {
    if (elem.email === email && elem.password === password) {
      console.log("user found , id: " + elem.id);
      foundUser = elem;
    }
  });

  if (foundUser) {
    const token = jwt.sign(
      {
        email: foundUser.email,
      },
      JWT_SECRET
    );
    res.json({ token, user_id: foundUser.id });
  } else {
    res.send("User not found");
  }
});
// middleware
async function auth(req, res, next) {
  const token = req.headers.token;
  console.log("Token: " + token);
  const decodedInfo = jwt.verify(token, JWT_SECRET);
  // console.log("decoded email :" + decodedInfo);
  // users.forEach((elem) => {
  //   if (elem.username === decodedInfo.username) {
  //     req.username = decodedInfo.username;
  //     next();
  //   }
  // });

  const response = await db.query("Select * from user_info");
  response.rows.forEach((elem) => {
    if (elem.email === decodedInfo.email) {
      // console.log('user found , id: '+elem.id);
      // foundUser=elem
      req.username = elem.username;
      next();
    }
  });
}

app.get("/me", auth, (req, res) => {
  res.json({ username: req.username });
});

app.listen(3002);
