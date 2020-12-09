const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

function generateRandomString() {
  let randomString = Math.random().toString(36).substring(6);
  return randomString;
};

app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }

};


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies['username']};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies['username']};
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  // const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
  let s = req.params.shortURL;
  // console.log(s);
  const templateVars = { shortURL: s, longURL: urlDatabase[s], username: req.cookies['username'] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  // console.log(res)
  const templateVars = {username: req.cookies['username']}
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  console.log(req.body);
  const newUserID = [generateRandomString()]
  users['newUserID'] = {
    id: newUserID,
    email: req.body['email'],
    password: req.body['password']
  };
  console.log(users);
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();  // Generates random string for a key
  const longURL = req.body.longURL;  // creates new vale for longURL
  urlDatabase[shortURL] = longURL; // assigns newly created key: value pair to urlDatabase object
  res.redirect(`/urls/${shortURL}`);  // redirects to :shortURL page
});


app.post("/login", (req, res) => {
  console.log(req.body);
  const username = req.body.username;
  if (username) {
    res.cookie('username', username);
    res.redirect(`/urls`);
  } else {
    res.send("FAILED LOGIN");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL // this gets the :shortURL
  const longURL = urlDatabase[shortURL]; // How to do i get the long url?
  res.redirect(longURL);
});

// Update 
app.post("/urls/:shortURL/update", (req, res) => {
  console.log(req) // prints out the whole page behind the scenes in the terminal
  const shortURL = req.params.shortURL;
  console.log(`Same shortURL: ${shortURL}`);
  const longURL = req.body.longURL;
  // res.send(`Updated long URL: ${longURL}`); // had it print out for the user to see
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');

});
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {  // deletes urls
  const shortURL = req.params.shortURL; // accesses keys in urlDatabase
  delete urlDatabase[shortURL]
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
