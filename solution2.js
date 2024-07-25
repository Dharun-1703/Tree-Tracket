import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "capitals",
  password: "0511",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM VISITED_COUNTRY");

  let CONTRIES = [];
  result.rows.forEach((country) => {
    CONTRIES.push(country.country_code);
  });
  return CONTRIES;
}

// GET home page
app.get("/", async (req, res) => {
  const CONTRIES = await checkVisisted();
  res.render("index.ejs", { CONTRIES: CONTRIES, total: CONTRIES.length });
});

//INSERT new country
app.post("/add", async (req, res) => {
  const input = req.body["country"];
  const result = await db.query(
    "SELECT country_code FROM contries WHERE country_name = $1",
    [input]
  );

  if (result.rows.length !== 0) {
    console.log(result.rows[0]);
    const data = result.rows[0];
    const countryCode = data.country_code;

    await db.query("INSERT INTO VISITED_COUNTRY (country_code) VALUES ($1)", [
      countryCode,
    ]);
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
