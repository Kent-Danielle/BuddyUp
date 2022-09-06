<p align="center">
 Click here!
 <a href="https://buddy-up-comp2800.herokuapp.com/">https://buddy-up-comp2800.herokuapp.com/</a>
</p>

# BuddyUp

BuddyUp is a chatroulette web application, to help gamers find other gamers based on the games they play, with a user profile feature to assist users in deciding if they want to chat with the matched user.

[![Watch the video](https://img.youtube.com/vi/zfrqFqDBm3s/maxresdefault.jpg)](https://youtu.be/zfrqFqDBm3s)

## Technology used

**Client:** CSS, Bootstrap5, HTML5

**Server:** Node.js, Express, Socket.io

**Database:** MongoDB, Cloudinary

**Hosting:** Heroku


## List of File Contents
```
C:.
|   .env
|   .gitignore
|   databaseAccountInfo.txt
|   database_info.txt
|   package-lock.json
|   package.json
|   README.md
|   server.js
|
+---models
|       admin-request.js
|       chat-user.js
|       user-timeline.js
|       user.js
|
+---public
|   +---data
|   |   \---pfp
|   +---html
|   |       admin.html
|   |       admin_promotion.html
|   |       chat.html
|   |       edit-a-post.html
|   |       login.html
|   |       not_found.html
|   |       profile.html
|   |       profile_edit.html
|   |       register.html
|   |       write-a-post.html
|   |
|   +---images
|   |       favicon.png
|   |       logo.png
|   |       profile.PNG
|   |
|   +---scripts
|   |       admin.js
|   |       chat.js
|   |       edit-a-post.js
|   |       filter.js
|   |       landing.js
|   |       login.js
|   |       not_found.js
|   |       profile.js
|   |       profile_edit.js
|   |       signup.js
|   |       tiny-editor.js
|   |       write-a-post-error.js
|   |
|   \---styles
|           admin.css
|           admin_promotion.css
|           chat.css
|           login.css
|           not_found.css
|           profile.css
|           profile_edit.css
|           signup.css
|           styles.css
|           write-a-post.css
|
\---routes
        index.js
        match.js
        users.js
```
## Installation
1. Install Node. and git
2. Install node package manager (npm)
3. Type ```npm i``` into the command line to install all of the packages
4. Type ```node server.js``` into the command line to local host the server
5. To host to heroku, install the heroku cli and type in ```git push heroku main```
\
**Recommended Software:** 
```
1. VSCode
2. MongoDBCompass
```

**Node libraries:**
```
 1. body-parser
 2. cloudinary
 3. cookie-parser
 4. express
 5. express-session
 6. jsdom
 7. mongoose
 8. multer
 9. nodemon
 10. socket.io
 11. socket.io-client
 12. tiny-editor
 ```
 **API Keys:** \
 API keys are available upon request.

 **Testing:** \
 [Click here for the testing log sheet](https://docs.google.com/spreadsheets/d/1KaKxvpp6fQiB8izWTNHjA1_0JZfZF1e3IIUn_F1HTRE/edit#gid=394496370) 
 
## Features

 **User Profile**
- Users can create posts on their profile by clicking on the "Write a story..." button.
    - Users can edit and delete their posts whenever they want
- Users can edit their account by clicking the button by their profile picture

**Match 'n Chat**
- Users can add filters based on the games they play before looking for a match 
- Before chatting, the users can see each other's profile to decide if they want to accept the match
- Whenever they are ready, they can press find match and the app will find someone with similar filters 
    - If there is no one, it will eventually match you with anyone available
- When your done talking, you can just click find next, and it will find another match

**Admin**
- Admins have the ability to add, edit, and delete accounts from the admin dashboard.
- To become an admin, make an admin request from the login page, and an already-existing admin will decide if they want to promote you.
## References

- [Front-end Design Inspiration (glass)](https://css.glass/)
- [Front-end Design Inspiration (gradient)](https://cssgradient.io/)
- [Icons](https://fontawesome.com/)




## Contact Information

**Company Email:**
uptech.co.09@gmail.com

**Dev Team Emails:**
- Sam: sbredenhof@my.bcit.ca
- Clayton: chunter52@my.bcit.ca
- Tommy: tnguyen528@my.bcit.ca
- Kent: kconcengco@my.bcit.ca
