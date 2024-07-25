import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app=express();
const port=3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

const db=new pg.Client({
  user:"postgres",
  host:"localhost",
  database:"capitals",
  password:"0511",
  port:5432
});

db.connect();
async function check() {
  const result=await db.query("SELECT country_code FROM VISITED_COUNTRY")
  let countries=[];
  result.rows.forEach((country)=>{
    countries.push(country.country_code);
  })
  return countries;
}
app.get('/',async(req,res)=>{
  const countries=await check();
  res.render("index.ejs",{CONTRIES:countries,total:countries.length});
})

app.post("/add",async(req,res)=>{
  const input=req.body["country"];
  try {
    const result=await db.query("SELECT country_code from CONTRIES WHERE LOWER(country_name) LIKE '%'||$1||'%';",[input.toLowerCase()])
    const countries=result.rows[0].country_code;
    try {
      await db.query("INSERT INTO VISITED_COUNTRY (country_code) VALUES ($1)",[countries]);
      res.redirect("/");
    } catch (error) {
      console.log(error.message);
      const countries=await check();
      res.render("index.ejs",{
        CONTRIES:countries,
        total:countries.length,
        error:"Country name already exist "
      })
    }
  } catch (error) {
    console.log(error.message);  
    const countries=await check();
    res.render("index.ejs",{
      CONTRIES:countries,
      total:countries.length,
      error:"Country name does not exist, try again."
    });
  }
})

app.listen(port,()=>{
  console.log(`server is on ${port}`);
})