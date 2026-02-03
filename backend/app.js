const express = require("express")
const app = express();

const path = require("path");
const ejsMate = require("ejs-mate");

app.set('view engine', 'ejs');

// ✅ Point Express to frontend/views
app.set(
  "views",
  path.join(__dirname, "..", "frontend", "views")
);

// ✅ Serve frontend static files (CSS, JS, images)
app.use(
  express.static(
    path.join(__dirname, "..", "frontend", "public")
  )
);

app.use(express.static(path.join(__dirname, "..", "frontend", "public")));


app.use(express.urlencoded({extended: true}));

app.engine('ejs', ejsMate);

let port = 8080;
app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});

// app.get("/admin/dashboard", (req,res) => {
//     res.render("admin");
// });

// app.get("/admin/:userID", (req,res) => {
//     res.send("Welcome to user details!");
// });


// app.get("/user/:userId/workout", (req,res) => {
//     res.send("Welcome to workout Page!");
// });

// app.get("/user/:userId/diet", (req,res) => {
//     res.send("Welcome to workout Page!");
// });

// app.get("/user/:userId/entry", (req,res) => {
//     res.send("This is entry card!");
// });

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/signup", (req,res) => {
    res.render("signup");
});

app.post("/user/dashboard", async (req, res) => {
  const { name, email, password, role } = req.body;

  console.log(name, email, password, role);

  if (role === "admin") {
    // Later: validate admin credentials
    return res.render("admin");
  }

  if (role === "member") {
    // Later: validate member credentials
    return res.render("member");
  }

  res.status(400).send("Invalid role");
});

app.post('/signup', async (req, res) => {
  const { fullname, email, password, role, adminCode } = req.body;

  console.log(req.body);

  // TEMP validation
  if (role === 'admin' && adminCode !== 'AURA2024') {
    return res.send('Invalid Admin Code');
  }

  // TODO: save user to MongoDB
  // await Member.create({ name: fullname, email, password, role });

  if (role === 'admin') {
    return res.render('admin');
  }

  res.render('member');
});


app.get("/", (req, res) => {
    res.render("landing");
});