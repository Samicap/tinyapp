const express = require("express");
const app = express();
const PORT = 8080;
// const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');


app.set("view engine", "ejs");
// app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));






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

const urlDatabase = {
  // "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: users[req.cookies['user_id']]},
  // "9sm5xK": {longURL: "http://www.google.com", userID: users[req.cookies['user_id']]}
};

function generateRandomString() {
  let randomString = Math.random().toString(36).substring(6);
  return randomString;
};

const addNewUser = function(email, password) {
  const userID = generateRandomString(); // Creates a new user in the Users object

  users[userID] = {
    id: userID,
    email: email,
    hashedPassword: bcrypt.hashSync(password, 10)
  }

  return userID;
};

// const isUserLoggedIn = function(users, templateVars) {
//   for (let keys in users) {
//     if (users[keys].id === templateVars.cookieUser){
//       return true;
//     } else {
//     return false;
//     }
//   }
// };

const getUser = function(email, password){
  for(let key in users){ // key = string index of users
    if(users[key].email === email && password !== ""){
      
      if (bcrypt.compareSync(password, users[key].hashedPassword)) {
        return users[key];
      } else {
        return null;
      }
    }
  }
};


const userEmailExists = function(email) {
  for (const [id, user] of Object.entries(users)) {  // Iterates over the objects of object users
    if (email === user.email){
      return true;
    }
  }
  return false;
};

const urlsForUser = function(id) {
  let userURLS = {};
  for (let shortURL in urlDatabase) {
    if (id === urlDatabase[shortURL]["userID"]) {
      userURLS[shortURL] = {longURL:urlDatabase[shortURL]['longURL']};  // Object literal
    }
  }
  return userURLS;
};


app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls", (req, res) => {
  // const user = users[req.cookies['user_id']]; //old way of doing non encrypted cookies.

  // const userID = req.session[‘user_id’]
  // const user = users[userID]
  // const templateVars = {urls: urlsForUser(userID), userObject: user};
  const user = users[req.session['user_id']]
  const templateVars = {urls: urlsForUser(req.session['user_id']), userObject: user}; 
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session['user_id']];
  if (!user) {
    res.redirect("/login");
    return;
  }
  const templateVars = {userObject: user};
  res.render("urls_new", templateVars);
});



app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session['user_id']];
  let shortURL = req.params.shortURL;
  let newlongURL = urlDatabase[shortURL]['longURL']; // there is no long url in the req.params or req body this is a BUGG!
  if (req.session['user_id'] === urlDatabase[shortURL]['userID']) {
    const templateVars = { shortURL: shortURL, longURL: newlongURL, userObject: user };
    res.render("urls_show", templateVars);
  } else {
    res.sendStatus(403);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  const user = users[req.session['user_id']];
  const templateVars = {userObject: user};
  res.render("urls_register", templateVars);
});


app.post("/register", (req, res) => {
  if (req.body['email'] === "" || req.body['password'] === "") { // if the user enters an empty field its rejected
    res.status(400).send("Email and/or Password cannot be empty. Status code 400.")
  } else if (userEmailExists(req.body["email"])){ //check is the user email is taken
    res.status(400).send("User email already exists. Try logging in. Status code 400.")
  } else {
    let userID = addNewUser(email=req.body["email"], password=req.body["password"])
    // res.cookie('user_id', userID) // Sets the user object to a cookie
    req.session.user_id = userID; //not sure what to do here. is this
    console.log(req.session)
    res.redirect('/urls');
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();  // Generates random string for a key
  const longURL = req.body.longURL;  // creates new vale for longURL
  const userID = users[req.session['user_id']].id;
  urlDatabase[shortURL] = {longURL, userID}; // assigns newly created key: value pair to urlDatabase object
  res.redirect(`/urls/${shortURL}`);  // redirects to :shortURL page
});

app.get("/login", (req, res) => {
  const user = users[req.session['user_id']];
   // This key-value pair maps between ejs variables (keys) and JS variables (values)
   const templateVars = {userObject: user};
   res.render("urls_login.ejs", templateVars);
});

app.post("/login", (req, res) => {
  let userEmail = req.body["email"];
  let password = req.body["password"];

  let userValid = getUser(userEmail, password);

  if (!userEmailExists(userEmail)) {
    res.status(403).send("Email not match any existing users.  Status code 403");
  }

  if (userValid) {
    // both email and password match
    req.session.user_id = userValid.id;
    res.redirect(`/urls`);
  }
  else {
    res.status(403).send("Password does not match user.  Status code 403");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const goToLongURL = urlDatabase[shortURL]['longURL']
  res.redirect("http://" + goToLongURL);
});


// Update 
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL; 
  const user = users[req.session['user_id']];
  if (req.session['user_id']=== urlDatabase[shortURL]['userID']) {
    urlDatabase[shortURL] = {longURL: longURL, userID: user.id};
    res.redirect('/urls');
    } else {
    res.redirect("/login");
  }
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {  // deletes urls
  const shortURL = req.params.shortURL; // accesses keys in urlDatabase
  const user = users[req.session['user_id']];
  if (req.session['user_id']=== urlDatabase[shortURL]['userID']) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
    } else {
    res.redirect("/login");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
