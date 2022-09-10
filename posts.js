const express = require("express");
const uniqid = require("uniqid");
const client = require("./database");

const router = express.Router();
const posts = [];
const comments = [];

//Get all posts
router.get("/posts", async(req, res) => {
  console.log(req.user);
  const result = await client.query('SELECT * FROM posts');
  res.status(200).send(result.rows);
});

//Create the post
router.post("/posts", async(req, res) => {
  const{title, body, tags=[]} = req.body;

  if(!title||!body){
    res.status(400).send({
      message: "Post title or content can not be empty!"
    });
    return;
  }

  await client.query(`
    INSERT INTO posts(title, body, tags, user_id)
    VALUES($1, $2, $3, $4);`,
    [title, body, tags.join(','), req.user.id]
    )
  res.status(201).send("Post Saved Successfuly");
  // console.log(req.body);
});

// Create Comment
router.post("/posts/:id/comments", async(req, res)=>{
  if(!req.body.content){
    res.status(400).send({
      message:"Content can not be empy!"
    });
    return;
  }
  await client.query(`
    INSERT INTO comments(body, user_id, post_id)
    VALUES($1, $2, $3);`
    ,[req.body.content, req.user.id, req.params.id]
    );
  res.status(201).send("Comment Saved");
});

//Get the post
router.get("/posts/:id", async(req, res) => {
  const result = await client.query(`
    SELECT * FROM posts WHERE id=$1
  `,[req.params.id]);
  if (result.rowCount > 0) {
    res.status(200).send(result.rows);
  } else {
    res.status(404).send("Post Not Found!");
  }
});

// Get Post's Comments
router.get("/posts/:id/comments", async(req, res)=>{
  const result = await client.query(`
    SELECT * FROM comments WHERE post_id=$1
  `,[req.params.id]);
  res.status(201).send(result.rows);
});

//Update the post
router.put("/posts/:id", async(req, res) => {
  const {title, body, tags=[]}=req.body;
  const result  = await client.query(`SELECT * FROM posts WHERE id=$1`,[req.params.id]);
  const post = result.rows[0];
  console.log(result.rows);
  console.log("post ->" + post);
  if (post) {
    if (req.user.id === post.user_id) {
      await client.query(`
        UPDATE posts 
        SET title=$1, body=$2, tags=$3
        WHERE user_id=$4;
      `,[title, body, tags.join(','),req.user.id]);
      res.status(200).send({
        message: "Post Successfuly Changed",
      });
    }
    else{
      res.status(403).send("Dont Touch Another People's Post!");
    }
  } else {
    res.status(404).send({
      message: "Post Not Found!",
    });
  }
});

// Update the post with patch
router.patch("/posts/:id", (req, res) => {
  const post = posts.find((post) => post.id === req.params.id);
  if (post) {
    if (req.body.name) {
      post.name = req.body.name;
    }
    if (req.body.title) {
      post.title = req.body.title;
    }
    res.status(200).send("Post Successfuly Changed");
  } else {
    res.status(404).send({
      message: "Post Not Found!",
    });
  }
});

//Delete the post
router.delete("/posts/:id", async(req, res) => {
  const result = await client.query(`
    SELECT * FROM posts WHERE id=$1`
  ,[req.params.id]);
  if (result.rowCount > 0) {
    if(req.user.id === result.rows[0].user_id){
      await client.query(`DELETE FROM posts WHERE id=$1`,[req.params.id]);
      res.status(201).send("Post Successfuly Deleted");
    }
    else{
      res.status(403).send("Dont Touch Another People's Post!");
    }
  } else {
    res.status(404).send("Post Not Found!");
  }
});

//Reactions
router.post("/posts/:id/reactions", async(req, res)=>{
  await client.query(`
  INSERT INTO reactions(user_id, posts_id)
  VALUES($1, $2)
  `,[req.user.id, req.params.id]);
  res.status(201).send("LIKED!");
});

module.exports = router;
