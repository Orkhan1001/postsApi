const client = require('./database.js');
const fs = require('fs');

let sqldata = '';
fs.readFile('./database.sql', (err, res)=>{
    // console.log(res.toString());
    sqldata = res.toString();
});

client.query(
`CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    PASSWORD VARCHAR(255),
    fullName VARCHAR(50),
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts(
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    body TEXT,
    tags VARCHAR(255),
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reactions(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    posts_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    body VARCHAR(1000),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);`, (err, res)=>{
    if(err){
        console.log(err.message);
        return;
    }
    
    console.log(res.rows);
    client.end();
});
