var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3008;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));


var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({
    defaultLayout: path.join(__dirname, "/views/layout/main"),
    partialsDir: path.join(__dirname, "/views/layout/partials")
}));
app.set("view engine", "handlebars");


// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/NewMongoScraper");

// Routes

app.get('/', function(req, res){
    console.log("get");
    db.Article.find({}).then(function (data) {
        var articleObject = {
        articleData: data,
    };
        // console.log("article object" + (data));
        return res.render("index", articleObject);
    })
    .catch(function(err) {
        // If an error occurred, send it to the client
        return res.json('Error: ' + err);
    });

    // res.send('Welcome to the MongoDB Scraper');
});

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("http://www.chicagotribune.com/news/local/breaking/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every section with the following class, and do the following:
    $("section.trb_outfit_group_list_item_body").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("h3.trb_outfit_relatedListTitle").children("a.trb_outfit_relatedListTitle_a").text();
      result.link = $(this).children("h3.trb_outfit_relatedListTitle").children("a.trb_outfit_relatedListTitle_a").attr("href");
      result.summary = $(this).children("p.trb_outfit_group_list_item_brief").text();
    
      console.log(result);

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json('Error: ' + err);
        });

    });
    // If we were able to successfully scrape and save an Article, send a message to the client
    res.redirect("/");
  });
});


// Route for displaying all Articles from the db when user clicks "scrape new article"
app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        return res.json('Error: ' + err);
      });
  });

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      return res.json('Error: ' + err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/notes/:id", function(req, res) {
  
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });  
      
      res.redirect('/saved');
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
    //   res.json(err);
    });
});

// // Route for viewing saved articles

app.get('/saved', function(req, res){
    db.Article.find({'saved': true}) 
    .then(function(data){
        // var savedObject = {
        //   Article: savedData
        // };
        res.send('Saved Data')
    })
    .catch(function(err) {
        // If an error occurred, send it to the client
        res.json('ERROR: ' + err);
    });
        // console.log(savedData);    
        // console.log('Saved Articles: ' + savedObject);
        // res.render('saved', savedObject);
        // If there are no errors, send the data to the browser as json
        // res.json(savedObject);      
});

// Route to save an article
app.post('articles/save/:id', function(req, res){
    db.newsData.findOneAndUpdate({_id: req.params.id}, {saved: true})
        .then(function(data){
            res.json('route to save data');
            // res.json(dbSaveArticle);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json('ERROR: ' + err);
        });
});

    // Route to delete an article
    app.post("/articles/delete/:id", function(req, res) {
        db.Article.findOneAndUpdate({ "_id": req.params.id }, {"saved": false, "notes": []})
        .then(function(err, dbDeletedArticle) {
            res.send(dbDeletedArticle);
        })
        .catch(function(err) {
        // If an error occurred, send it to the client
            res.json('ERROR: ' + err);
        });
    });

// Route to delete note
    app.delete("/notes/delete/:note_id/:article_id", function(req, res) {      
        db.Note.findOneAndRemove({ "_id": req.params.article_id }, {$pull: {"notes": req.params.note_id}})
            .then(function(dbNoteDelete) {
                return res.json(dbNoteDelete);
                console.log("Note Deleted!");
            })
            .catch(function(err) {
                // If an error occurred, send it to the client
                res.json('ERROR: ' + err);
            });
          });

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});