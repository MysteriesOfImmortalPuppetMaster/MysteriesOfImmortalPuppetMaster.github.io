**M.O.T.I.P.M. Translation**

This site exists to read the community translation of Puppet Insanity.
feel free to contribute.


......................................

**Steps to update this site with new chapters:**

- Put the .txt file of the chapter into "/chapters"
name the .txt file as the N-th chapter it repesents. So chapter 300 = 300.txt  ( Floats are supported for Sub chapters or Author notes )
Remember that the first line of the .txt file will be used as a Headline

- run "UpdateWebsite.py"
This will both update the chapter index, removing chapters that no longer exist, have been renamed or have been added., aswell as update the html files located inside /read

- Update the follwing variable inside "script.js" inside the folder this .README is placed in:  const chaptersPerBook = [232, 500]; // Array of cutoff points for books   
In case a new book has been reached. Each number represents the end of a book, while the last variable is just an arbitrarily large cutoff point.

( This should cover the basics. )




**Steps to convert this site into displaying your own book:**

- Same steps as "*Steps to update this site with new chapters:*"

- update "pp1.webp", "banner50percent.webp", cover50.webp" with your own images.
I have found that a 50% compression rate ( lossy ) on Webp images results in the greatest file size to image quality, which is why the 50 in the name, ( lossless versions can be found in the .backup folder )

- remove google988ebf...html as it serves to proof to google that i am the owner of the git site.

- inside index.html ( root folder ) 
- in the meta tags section: replace the folowing imgur link with an upload of your cover. ( linking the raw image from github turned out not to work ) ((  <meta property=."og:image" content="https://i.imgur.com/5QU6ZWZ.png" /> ))
- remove the google analytics script.
- in the "book info class:  change author and the link to the Author's page ( <p>Author: <a href=."https://my.qidian.com/author/1338744/" style="color: inherit; text-decoration: none;">Gu Zhen Ren, 蛊真人</a></p> )
- in the "book info class:  change book title (  <>Mysteries Of Immortal Puppet Master</> )
- in the "Synopsis" Section: Change the Synopsis. ( "preview Synopsis is the first half, "full synopsis" is the 2nd. the full synopsis is revealed with the arrow button )

- inside template.html ( root/read/ )
- Change this title. in the head:  ( <meta name="description" content=."A fan-translation of the book &quot;Mysteries Of Immortal Puppet Master.&quot;"> )
- also change this imgur link again: ( <meta property=."og:image" content="https://i.imgur.com/5QU6ZWZ.png" /> )
For those wondering, it exists as a "preview image" that you see when you paste the link on sites like discord, facebook and **good** webbrowsers that aren't google.
- change title: ( <title>Mysteries Of Immortal Puppet Master</title> )
- remove google analytics script ( again )
- change the headline, displaying the book name (  <><a href=."../../" style="text-decoration: none; color: inherit;">Mysteries Of Immortal Puppet Master</a></> )
This also serves as a link to the Homepage

- Inside "UpdateWebsite.py ( root )"
- on line 140 ( almost at the bottom of the script )
- Change  base_title = "Mysteries Of Immortal Puppet Master - "
To the Title of your book. ( this will change the Name each specific chapter page, so that in a webbrowser for example, if this site pops up, it displays "Your very special book -  Chapter 400: Something happens"

- Miscaleneous: 
For the overarching structure of the page,
The root directory is the homepage, where all the scripts are run, and all the non- specific ressources are located.
Inside the /chapters folder is just a .txt dump of all the chapters
Inside the /read folder are all the index.html files, that will display each chapter. These files are updated using "UpdateWebsite.py" and are based off of template.html.
Meaning, if you want to edit the structure of all the chapters, do not edit the index.html files, edit the template.html file.
Also, the folder root/read/template has the ressources needed to power each chapter. if you want to make changes to for example the .css file, change the one inside the /template folder.
DO NOT CHANGE THE .css file outside the /template folder, as those will be deleted and replaced by the python script.
If your updated template.html needs a ressource not included, dump it into the /template folder

As for why this system exists,
Up until the near end of the completion of this site, i was not aware that shared ressources could be linked via "../", in oder to pull ressources from outside a folder.
I used to paste every file inside /template into every chapter folder.
T.L.D.R.
I made it cuz its dumb, and i am too lazy to change it.



-update 02/03/25
made a bunch of changes to the site.
At this point, its hopeless.
just give me a github message and i'll try to figure out how to configure this site.
it has so many variables and stuff, that it would be a matter of hours just to configure this for a different book.
maybe i'll make the site truely functional and just base it on a bunch of files.
maybe i won't, cuz thats a lot of work.