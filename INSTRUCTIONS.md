INSTRUCTIONS FOR MONGOOSE/MONGODB HW

Requirements 
1. Scrape articles from a website
2. Save those articles
3. Save comments to the articles
4. Delete Comments 
5. Delete articles

Features on the Front End
*Navigation bar: ‘Home’ ‘Saved Article’ ’Scrape New Articles’m
1. Landing page there are no articles present
2. Scrape new articles button —> Modal that shows new articles available
3. Each article has a “Save Article Button” 
4. That button links to “Saved Articles” in the Nav Bar 
5. Saved Articles have a “Article Notes” and “Delete from saved” button
6. “Article Notes button” —> Modal title: ‘notes for article + article id#’ and textfield for adding a note and heading displaying there are no notes 
7. After a note(s) are added the “Article Notes button” will list all the notes in order
8. Each note listed should have an ‘x’ or something alike letting the user to delete the notes 
9. “Delete Saved Button” to remove articles from saved list 

Back End Features 
Scripts /scrape.js is the javascript file for the front end
Routes/api/ 
- Fetch: is the scrape route
- Headlines: route to display the articles 
- Notes: routes for generating notes 
- Index: contains all the before mentioned api routes 

Controllers are responsible for button functionality 
- Fetch:
- Headlines:
- Note: 


*figure out website to scrape Chicago Tribune 
*find the information you want to scrape from cherrio

article a.js_curation-click summary .content-meta__excerpt long-excerpt (p) URL a.js_curation-click (href)

*scrape the information using cherrio- article, summary, URL come up with routes
/ (home - shows all scraped articles) /scrape (on click of a button you are going to call the scape route) /saved - saved articles
*save to database - use exercise 11/save in server.js use mongoose need models: (filter for your information - goes through a model and saves it that way; it validates your information before saving to database) article.js - will have article, summary, url all strings all required - (make sure you have all the information before saving to the database) note.js - title/body of note and strings and both would be required
*Show the articles/summary/URL through javascript - handlebars will show information
*give the user the ability to save article need a button which will need jquery to function user saved articles will go to /saved.
*allow the user to leave notes modal - front end form submit button notes need to be saved to database
inside database youll have two tables: articles (articles.js)/ notes (notes.js)
*allow the user to delete articles (deleting from database) use mongoose .delete() method
