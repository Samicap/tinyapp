const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));



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

function generateRandomString() {
  let randomString = Math.random().toString(36).substring(6);
  return randomString;
};

// const addNewUser = function(email, password) {
//   const userID = generateRandomString(); // Creates a new user in the Users object
//   users[userID] = {
//     id: userID,
//     email: req.body['email'],
//     password: req.body['password']
//   }
// };

const getUser = function(email, password){
  for(let key in users){ // key = string index of users
    if(users[key].email === email && users[key].password === password){
      console.log(users[key].email, email)
      return users[key];
    }
  }
};

// const getUserByEmail = function(email, password) {  // trying to create a function to return error codes if email / password does not match.
//   for (let userKey in users) {
//     if (users[userKey].email !== email) {
//       let errorMessage = "Cannot find that email";
//       res.status(403).send(errorMessage);
//     } else {
//       if (users[userKey].password === password) {

//       }
//     }
//   }
// };

const userExists = function(email) {
  for (const [id, user] of Object.entries(users)) {  // Iterates over the objects of object users
    if (email === user.email){
      return true;
    }
  }
  return false;
};



app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, cookieUser: req.cookies["user_id"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {cookieUser: req.cookies["user_id"]};
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  // const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
  let s = req.params.shortURL;
  // console.log(s);
  const templateVars = { shortURL: s, longURL: urlDatabase[s], cookieUser: req.cookies["user_id"] };
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
  const templateVars = {cookieUser: req.cookies["user_id"]};
  res.render("urls_register", templateVars);
});


app.post("/register", (req, res) => {
  if (req.body['email'] === "" || req.body['password'] === "") { // if the user enters an empty field its rejected
    let userError = req.body.statusCode = 400; // Resets the status code of the page
    res.send(`Status Code: ${userError}`);
  } else if (userExists(req.body["email"])){ //check is the user email is taken
    userError = req.body.statusCode = 400; 
    res.send(`Status Code: ${userError}. User email already taken`);
  } else {

    const userID = generateRandomString(); // Creates a new user in the Users object
    users[userID] = {
      id: userID,
      email: req.body['email'],
      password: req.body['password']
    };
    console.log(users);
    res.cookie('userID', userID) // Sets the user object to a cookie
    res.redirect('/urls');
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();  // Generates random string for a key
  const longURL = req.body.longURL;  // creates new vale for longURL
  urlDatabase[shortURL] = longURL; // assigns newly created key: value pair to urlDatabase object
  res.redirect(`/urls/${shortURL}`);  // redirects to :shortURL page
});

app.get("/login", (req, res) => {
   // This key-value pair maps between ejs variables (keys) and JS variables (values)
   const templateVars = {"cookieUser": req.cookies["user_id"]};
   res.render("urls_login.ejs", templateVars);
});

app.post("/login", (req, res) => {
  let userEmail = req.body["email"];
  let password = req.body["password"];
  let userFound = getUser(userEmail, password);

  if (userFound) {
    res.cookie('user_id', userFound);
    res.redirect(`/urls`);
  } else {
    res.status(403).send("Email and/or Password does not match.  Status code 403");
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
  res.clearCookie('user_id');
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
