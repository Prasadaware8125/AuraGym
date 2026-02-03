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

app.get("/admin/dashboard", (req,res) => {
    res.send("Welcome to dashboard!");
});

app.get("/admin/:userID", (req,res) => {
    res.send("Welcome to user details!");
});


// app.get("/user/dashboard", (req,res) => {
//     res.render("dashboard");
// });

app.post("/user/dashboard", (req, res) => {
    res.render("member");
})

app.get("/user/:userId/workout", (req,res) => {
    res.send("Welcome to workout Page!");
});

app.get("/user/:userId/diet", (req,res) => {
    res.send("Welcome to workout Page!");
});

app.get("/user/:userId/entry", (req,res) => {
    res.send("This is entry card!");
});



app.get("/", (req, res) => {
    res.render("landing");
});