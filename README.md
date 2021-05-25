#Campfire REST-Service manual

##Table of Contents
[Noteworthy features](#features)<br/>
[Default config file](#config)</br>
[Token variables](#general)<br/>
[Regular testing](#testing)<br/>
[Mocha Chai testing](#chai)<br/>

<a name="header" id="features"></a>
##REST noteworthy features
* **User roles**: *admin*, *user*, *registered*
* **Register service**, including verification email
* **Newsletter service**
* **Mocha Chai testing**
* **private message service**
* **commentary entity for posts**

<a id="config" name="header"></a>
##Default config file structur
Tokens used in testing, need to be newly generated if not using default used testing token 'abcd'.
Also an own certificate is required. place certificationes in /certificates.
<br/>config/default.json
```json
{
  "session": {
    "tokenKey": "TOKENKEY",
    "timeout": 300
  },
  "db": {
    "connectionString": "DB_LOCATION_URL",
    "dbConfigOptions": {
      "useNewUrlParser": true,
      "useUnifiedTopology": true
    }
  },
  "defaultAdmin": {
    "userID": "1",
    "password": "password",
    "username": "admin-user",
    "email": "ADMIN_EMAIL",
    "newsletter": true
  },
  "defaultForums": {
    "list": ["Guides","Artworks","esport","teams"]
  },
  "mailService": {
    "service": "MAILSERVICE_NAME",
    "username": "MAILSERVICE_EMAIL",
    "password": "MAILSERVICE_PASSWORD"
  }
}
```

<a id="general" name="header"></a>
##General (tokens)
There are 3 default tokens used in various test files,
that were generated in the past and are now reused for testing
purposes. Of course can the tester generate new tokens but is then forced
to refactor all test files, if he wants to use those freshly generated
tokens in later tests as well.

###the admin token: 
```sh
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYyMTE3NDQxMywiZXhwIjoxNjIyNzk1ODg3NTE5fQ.M-Rm9DUUIs_PzgVEV1ICDOOasVFjIgAezhSsHy6FWSk
```

###the user with the *'registered* status' token: 
```sh
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMiIsInJvbGUiOiJyZWdpc3RlcmVkIiwiaWF0IjoxNjIxMTc0MjMwLCJleHAiOjE2MjI3OTU3MDUxMDh9.xuJ2VaBLSN11U2Jaaezn0ABWFoYnRScBO5uWN4sPPVo
```

###the normal verified user token:
```sh
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjIxMjAyMjc0LCJleHAiOjE2MjI4MjM3NzY4NDJ9.exmgjYmcObyDuzd0LDS_d_yXqkAJBNxg06-vv-14KjM
```

They can just be leaved there if the server database isnt altered further as expected in the test cases.
The Base64 encoded login data is also ready to use, as long as the admin is succesfully saved with userId: 1 and
the user is saved as userId: 2, which should be the normal case.

Therefor most of the tests can be run immediately, if this is not the case its always stated with a note
beforehand.

#
<a id="testing" name="header"></a>
##Basic testing
####In the following section the different test file requirements and purposes are explained in detail:
**********
###[admin.http](REST-tests/admin.http)
* **manually create user as admin**
* **manually delete user as admin**

*************
###[register.http](REST-tests/register.http)
* **register new Account**
<br/>Its important to <span style="color: red">paste a real email adress here</span> to receive the validation email,
but can also be left like that, since the validation code is logged and can be copied from the console
```json
{
  "username": "uniqueName",
  "email": "marlonkerth@icloud.com",
  "password": "password"
}
```
* **resend verification**
<br/>If the account is still *role: **registered*** a new verification 
  mail can be send
  ####
* **verify account**
<br/><span style="color: red">paste the generated mailtoken here</span>
```http request
[...] verify?mailtoken=KD9jAE7MyshglpsuJbIb
```

*********
###[user.http](REST-tests/user.http)
* **login (here with admin account)**
Even though this is the user file and not the admin file, the admin token is
used, since this account doesnt need to be added manually
```http request
Authorization: Basic MTpwYXNzd29yZA==
decoded version:
Authorization: Basic 1:password
```
* **list all users**
  ####
* **change password**
<br/>recommended to change back the password to the default version
  *'password'* again, if planed to use the current database set for other
  tests aswell
  ####
* **check profil**
<br/>currently set that the user checks his own profil, since no userID is passed
  <br/>to check a different profil for example:
```http request
Content-Type: application/json

{
  "userID": "1"
}
```

*********
###[message.http](REST-tests/message.http)
* **send message to user**
<br/>Send a private message to a user. Since by default the user passed an
  email adress when registering, he will get an email notification including
  the message.
```json
{
  "toUsername": "username",
  "subject": "topic",
  "text": "message content"
}
```
####
* **get all messages**
<br/>Get all messages, that was sent to the user at one point.
####
* **get all messages the user sent to other users**
<br/>Get all messages, that the user sent to other user at one point.
####  
* **read a specific message**
<br/>read a specific message by providing the ObjectId, that was generated by the database
  and paste it with the action *'read'*
  ```http request
  https://localhost:443/messages/open?id=ObjectId&action=read
  ```
####
* **delete a specific message**
<br/>delete a specific message almost in the same manner as reading one.
  But instead of passing *'read'* as argument for action, here *'delete'* gets passed.
    ```http request
  https://localhost:443/messages/open?id=ObjectId&action=delete
  ```
  
*****
###[newsletter.http](REST-tests/newsletter.http)
* **subscribe to the newsletter**
<br/>Subscribe to the newsletter (not subscribed by default)
####  
* **unsubscribe from the newsletter**
<br/>Unsubscribe from the newsletter if currently subscribed.
####
* **send newsletter <span style="color: lightblue">(admin only)</span>**
An admin can pass a *subject* and *text* to send as a newsletter to all currently 
  subscribed users
  ```json
  {
    "subject": "email title",
    "text": "email text"
  }
  ```

*****
###[forum.http](REST-tests/forum.http) <span style="color: lightblue">- admin only functions</span>
The REST-services provided in this file are only for potential usages in the future if
a new forum beside the existing default ones is required
####
* **create forum**
#####
* **delete forum**
<br/>Can only delete non default forums.
  By deleting a forum all posts whil be deleted!
  But comments will be preserved.
#####
* **rename Forum**


*****
###[post.http](REST-tests/post.http)
* **create post**
  ```json
    {
      "title": "Post title",
      "content": "Post content",
      "forumName": "Forum to post in"
    }
  ```
####
* **view all posts in a forum**
<br/>pass a forum name to get all posts from this forum
####
* **edit post**
<br/>pass the post id for the post to edit and the text to change the content.
  after a post got edit the first time, the *'edited'* property will be set to true
####
* **view specific post**
<br/>pass post id to get proper post
    ```http request
  https://localhost:443/post/view?postId=PostId
  ```
####
* **view all posts from a user**
<br/>uses the userID from the auth. service to get all posts from the logged in user
####  
* **delete post**
<br/>delete post


*****
###[comment.http](REST-tests/comment.http)
* **create comment**
  ```json
    {
      "postId": "PostId in which the comment should be posted in",
      "content": "comment content"
    }
  ```
####
* **edit comment**
<br/>after editing a comment it will also be marked as *'edited'* just like a post.
####
* **show all comments from user**
<br/>uses the userID from the auth. service to get all comments from the logged in user
####
* **view all comments from a post**
<br/>pass postId to get all comments from a post
####
* **delete comment**
<br/>pass commentId to delete own comment

*****
<a id="chai" name="header"></a>
#Chai testing<br/>[go to file](REST-tests/chai.js)
Get an overview of each chai testing section,
if it can be directly run from *describe* or needs some
parameters, that are generated during the test run.

The portions are divided into the different *describe* sections
and lower specific testing parts.

Each testing part shows what kind of assertions are made.

* ###register user process <span style="color: red">cant just run describe</span>
    * #### register user
      - status(200)
    * #### register user with same email / username
      - status(400)
    * #### login with registered account
      - status(200)
    * #### resend verification email
      - status(200)
    * #### verify user <span style="color: red">paste verify code first</span>
      - status(200)
    
* ###user account testing <span style="color: green">can be run from describe</span>
    * ####get user list
      - status(200)
      - body be json
      - include json keys ['userID', 'username', 'role']
    * ####change password / change password back
      - status(200)
    * ####non admin trying to change password of other account
      - status(403)
    * ####get user profil data
      - status(200)
      - body be json
      - include json keys ['userID', 'username', 'role']
    
* ###message system <span style="color: red">cant just run describe</span>
    * ####send message <span style="color: lightblue">from user(id:2) to admin(id:1)</span>
      - status(200)
    * ####get all messages sent to user <span style="color: lightblue">user(id:2)</span>
      - status(200)
      - body be json
      - include json keys ['fromUserID','toUserID','subject', 'context']
    * ####get all messages that were sent by the user
      - status(200)
      - body be json
      - include json keys ['fromUserID','toUserID','subject', 'context']
    * ####get received message alone <span style="color: red">paste _id:ObjectId from the database</span>
      ```html
      action is set to read
      /messages/open?id=objectId&action=read
      ```
      - status(200)
      - body be json
    * ####delete message
      ```html
      action is set to delete
      /messages/open?id=objectId&action=delete
      ```
      - status(200)
      - body be html
    
* ###Newsletter service <span style="color: green">can be run from describe</span>
    * ####send Newsletter <span style="color: lightblue">(admin only)</span>
      ```json
      {
          "subject": "email title",
          "text": "email text content"
      }
      ```
      - status(200)
    * ####subscribe / unsubscribe from newsletter <span style="color: lightblue">default: false</span>
      - status(200)

* ###forum structure <span style="color: lightblue">(admin only)</span> <span style="color: green">can be run from describe</span>
    * ####create forum
        - status(200)
    * ####rename forum
        - status(200)
    * ####delete forum
        - status(200)
    
* ###post structure <span style="color: red">cant just run describe</span>
    * ####create post
      ```json
      {
          "title": "post title",
          "content": "content of post",
          "forumName": "In which forum to post"
      }
      ```
      - status(200)
    * ####user trying to delete other users post <span style="color: red">paste _id:ObjectId from the database</span>
        - status(403)
    * ####edit post <span style="color: red">paste _id:ObjectId from the database</span>
        - status(200)
    * ####delete post <span style="color: red">paste _id:ObjectId from the database</span>
        - status(200)
    * ####view specific post <span style="color: red">paste _id:ObjectId from the database</span>
        - status(200)
        - body to be json
        - include json keys ['postTitle','createdAt','postedByUserID', 'forumName', 'forumID', 'content']
    * ####view all own posts
        - status(200)
        - body to be an array
    * ####view all posts from one forum
        - status(200)
        - body to be an array
    
* ###comment structur <span style="color: red">cant just run describe</span>
    * ####create comment <span style="color: red">paste _id:ObjectId (from post) from the database</span>
      ```json
      {
      "postId": "PostId from post where comment should be posted on",
      "content": "content of comment"
      }
      ```
      - status(200)
    * ####view all comments from a post <span style="color: red">paste _id:ObjectId (from post) from the database</span>
      - status(200)
      - body to be an array
    * ####user trying to delete other users comment <span style="color: red">paste _id:ObjectId from the database</span>
      - status(403)
    * ####edit comment <span style="color: red">paste _id:ObjectId (from post) from the database</span>
      ```json
      {
      "commentId": "id of comment to be edited",
      "content": "text of new comment content"
      }
      ```
      - status(200)
    * ####view all own comments
      - status(200)
      - body to be an array
    * ####delete comment <span style="color: red">paste _id:ObjectId (from post) from the database</span>
      - status(200)