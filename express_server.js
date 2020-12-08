const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

function generateRandomString() {
  let randomString = Math.random().toString(36).substring(6);
  return randomString;
};


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls/:shortURL", (req, res) => {
  // const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
  let s = req.params.shortURL;
  console.log(s);
  const templateVars = { shortURL: s, longURL: urlDatabase[s] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();  // Generates random string for a key
  const longURL = req.body.longURL;  // creates new vale for longURL
  urlDatabase[shortURL] = longURL; // assigns newly created key: value pair to urlDatabase object
  res.redirect(`/urls/${shortURL}`);  // redirects to :shortURL page
  // console.log(req.params)
});

app.get("/u/:shortURL", (req, res) => {
  console.log(req.params.shortURL)
  const shortURL = req.params.shortURL // this gets the :shortURL
  const longURL = urlDatabase[shortURL]; // How to do i get the long url?
  console.log(longURL)
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
