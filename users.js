const express = require("express");
const uniqid = require("uniqid");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const client = require("./database");

const router = express.Router();
const users = [];
const SECRET_KEY = process.env.SECRET_KEY;
const SALT = process.env.SALT;

// get all users
router.get("/users", (req, res) => {
  res.status(200).send(users);
});

// Registiration
router.post("/registiration", async (req, res) => {
  const { username, fullName, password } = req.body;

  if(!username||!fullName||!password){
    res.status(400).send({
      message:"Username, FullName, Password can not be empty!"
    });
    return;
  }

  const hashedpassword = crypto
    .pbkdf2Sync(password, SALT, 100000, 64, "sha512")
    .toString("hex");

  const existingUser = await client.query(
    `SELECT * FROM users WHERE username=$1`,
    [username]
  );
  console.log(existingUser.rowCount);

  if (existingUser.rowCount > 0) {
    res.status(400).send({
      message: "Username allready exist!",
    });
    return;
  }

  const exampleimageurl =
    "https://robohash.org/autquiaut.png?size=50x50&set=set1";
  const result = client.query(
    `INSERT INTO users(username, password, fullname, image)
    VALUES($1, $2, $3, $4);`,
    [username, hashedpassword, fullName, exampleimageurl]
  );
  res.status(201).send("Registiration Successful");
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if(!username||!password){
    res.status(400).send({
      message: "Username, Password can not be empty!"
    });
    return;
  }
  
  const hashedpassword = crypto
    .pbkdf2Sync(password, SALT, 100000, 64, "sha512")
    .toString("hex");
  console.log(hashedpassword);
  const result = await client.query(
    `SELECT * FROM users 
    WHERE username=$1 AND password=$2`,
    [username, hashedpassword]
  );

  console.log(result.rows);
  if (result.rowCount > 0) {
    const { password, ...theRest } = result.rows[0];
    const accessToken = jwt.sign(theRest, SECRET_KEY);
    res.status(200).send({
      accessToken,
    });
  } else {
    res.status(401).send({
      message: "Wrong Usename or Password!",
    });
  }
});

module.exports = router;
