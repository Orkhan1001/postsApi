require('dotenv').config();
const express = require("express");
const jwt = require('jsonwebtoken');
const postRoutes = require("./posts");
const userRoutes = require("./users");

const app = express();
const PORT = process.env.PORT || 8080;

app.use((req, res, next)=>{
  if(req.url ==='/registiration' || req.url === '/login'){
    next();
    return;
  }

  const accessToken = req.headers.authorization;

  if(accessToken){
    jwt.verify(accessToken, process.env.SECRET_KEY, (err, decoded)=>{
      if(err){
        res.status(401).send("sen o sen deyilsen!");
      }
      else{
        req.user = decoded;
        next();
      }
    });
  }
  else{
    res.status(401).send("Unauthorized request");
  }

});
app.use(express.json());

app.use(postRoutes);
app.use(userRoutes);

app.listen(PORT, () => {
  console.log("Posts API is running on port " + PORT);
});
