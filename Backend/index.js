import axios from "axios";
import pg from "pg";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
const port = 3001;
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
  console.log(response.rows);
  res.send(response.rows);
});

app.get("/featuredbooks", async (req, res) => {
  const response = await db.query("select * from featured_books");
  console.log(response.rows);

  res.send(response.rows);
});

app.get("/fictionalbooks",async(req,res)=>{
  const response=await db.query('select*from fictional_books')
  console.log(response.rows)
  res.send(response.rows);
})

app.get("/selfhelpbooks",async(req,res)=>{
  const response=await db.query("select* from self_help_books");
  console.log(response.rows)
  res.send(response.rows)
})

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
