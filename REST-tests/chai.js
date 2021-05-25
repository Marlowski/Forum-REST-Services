process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

let chai = require('chai');
let chaiHttp = require('chai-http');
const assertArrays = require('chai-arrays');
let expect = chai.expect;

let host = require('../src/server')

chai.use(assertArrays);
chai.use(chaiHttp);

before((done) => {
    chai
        .request(host)
        .get('/')
        .end(function (err, res) {
            expect(res).to.have.status(200);
            expect(res.text).to.equal('Main page');
            //timeout so admin account is initalized prior to new accounts
            setTimeout(function () {
                done();
            }, 100);
        });
});

describe('Register user process', () => {
    it('register user', (done) => {
        chai
            .request(host)
            .post("/register")
            .send({
                "username": "uniqueName2",
                "email": "marlonkerth@web.de",
                "password": "password"
            })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('register user with same email / username', (done) => {
        chai
            .request(host)
            .post("/register")
            .send({
                "username": "uniqueName3",
                "email": "marlonkerth@web.de",
                "password": "password"
            })
            .end(function (err, res) {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('login with registered account', (done) => {
        chai
            .request(host)
            .post('/authenticate/login')
            //Auth.: Basic 2:password
            .set({ "Authorization": "Basic MjpwYXNzd29yZA==" })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('resend new auth. email', (done) => {
        let registeredUsertoken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMiIsInJvbGUiOiJyZWdpc3RlcmVkIiwiaWF0IjoxNjIxMTc0MjMwLCJleHAiOjE2MjI3OTU3MDUxMDh9.xuJ2VaBLSN11U2Jaaezn0ABWFoYnRScBO5uWN4sPPVo";
        chai
            .request(host)
            .post('/users/resend-verification')
            .set({ "Authorization": `Bearer ${registeredUsertoken}` })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('verify registered user', (done) => {
        //paste generated mailtoken here
        let mailtoken = "gdvD56533xbhpmJvaOJ0xi8Ht";

       chai
           .request(host)
           .get('/register/verify?mailtoken=' + mailtoken)
           .end(function (err, res) {
               expect(res).to.have.status(200);
               done();
           });
    });
});

describe('User Account testing',() => {
    let registeredUserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMiIsInJvbGUiOiJyZWdpc3RlcmVkIiwiaWF0IjoxNjIxMTc0MjMwLCJleHAiOjE2MjI3OTU3MDUxMDh9.xuJ2VaBLSN11U2Jaaezn0ABWFoYnRScBO5uWN4sPPVo";
    let admintoken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYyMTE3NDQxMywiZXhwIjoxNjIyNzk1ODg3NTE5fQ.M-Rm9DUUIs_PzgVEV1ICDOOasVFjIgAezhSsHy6FWSk";

    it('get user list', (done) => {
        chai
            .request(host)
            .get("/users")
            .set({ "Authorization": `Bearer ${admintoken}` })
            .end(function(err, res) {
                expect(res).to.be.json
                expect(res.body[0]).to.includes.keys(['userID', 'username', 'role']);
                expect(res).to.have.status(200);
                done();
            });
    });

    it('change password', (done) => {
       chai
           .request(host)
           .post('/users/change-password')
           .set({ "Authorization": `Bearer ${registeredUserToken}` })
           .send({
               "password": "password2"
           })
           .end(function (err, res) {
               expect(res).to.have.status(200);
               done();
           });
    });

    it('change password back to default', (done) => {
        chai
            .request(host)
            .post('/users/change-password')
            .set({ "Authorization": `Bearer ${registeredUserToken}` })
            .send({
                "password": "password"
            })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('non-admin trying to change other users password', (done) => {
       chai
           .request(host)
           .post('/users/change-password')
           .set({ "Authorization": `Bearer ${registeredUserToken}` })
           .send({
               "userID": "1",
               "password": "password"
           })
           .end(function (err, res) {
               expect(res).to.have.status(403);
               done();
           });
    });

    it('user looking up his profil data', (done) => {
        chai
            .request(host)
            .post('/users/profil')
            .set({ "Authorization": `Bearer ${registeredUserToken}` })
            .end(function (err, res) {
                expect(res).to.be.json;
                expect(res.body).to.includes.keys(['userID', 'username', 'role']);
                expect(res).to.have.status(200);
                done();
            });
    });
});

//expected to have registered and verified user with UserId:2 in db existing
describe("Message system", () => {
    let adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYyMTE3NDQxMywiZXhwIjoxNjIyNzk1ODg3NTE5fQ.M-Rm9DUUIs_PzgVEV1ICDOOasVFjIgAezhSsHy6FWSk";
    let verifiedUserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjIxMjAyMjc0LCJleHAiOjE2MjI4MjM3NzY4NDJ9.exmgjYmcObyDuzd0LDS_d_yXqkAJBNxg06-vv-14KjM";

    it('send message', (done) => {
       chai
           .request(host)
           .post('/messages/send')
           .set({ "Authorization": `Bearer ${verifiedUserToken}` })
           .send({
               "toUsername": "admin-user",
               "subject": "Question",
               "text": "Hello, where can i change my password?"
           })
           .end(function (err, res) {
               expect(res).to.have.status(200);
               done();
           })
    });

    it('get all messages sent to user', (done) => {
        chai
            .request(host)
            .get('/messages')
            .set({ "Authorization": `Bearer ${adminToken}` })
            .end(function (err, res) {
                expect(res).to.be.json
                expect(res.body[0]).to.includes.keys(['fromUserID','toUserID','subject', 'context']);
                expect(res).to.have.status(200);
                done();
            });
    });

    it('get all messages that were sent by the user', (done) => {
        chai
            .request(host)
            .get('/messages/sent-messages')
            .set({ "Authorization": `Bearer ${verifiedUserToken}` })
            .end(function (err, res) {
                expect(res).to.be.json
                expect(res.body[0]).to.includes.keys(['fromUserID','toUserID','subject', 'context']);
                expect(res).to.have.status(200);
                done();
            });
    });

    it('read message isolated', (done) => {
        //paste from db generated ObjectId
        let objectId = "60a3d152b58730a49c67be9f";
        let action = "read";

       chai
           .request(host)
           .get('/messages/open?id=' + objectId + '&action=' + action)
           .set({ "Authorization": `Bearer ${adminToken}` })
           .end(function (err, res) {
               expect(res).to.be.json;
               expect(res).to.have.status(200);
               done();
           })
    });

    it('delete message', (done) => {
        //paste from db generated ObjectId
        let objectId = "60a3d152b58730a49c67be9f";
        let action = "delete";

        chai
            .request(host)
            .get('/messages/open?id=' + objectId + '&action=' + action)
            .set({ "Authorization": `Bearer ${adminToken}` })
            .end(function (err, res) {
                expect(res).to.be.html;
                expect(res).to.have.status(200);
                done();
            })
    });
});

describe('Newsletter service', () => {
    let adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYyMTE3NDQxMywiZXhwIjoxNjIyNzk1ODg3NTE5fQ.M-Rm9DUUIs_PzgVEV1ICDOOasVFjIgAezhSsHy6FWSk";
    let verifiedUserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjIxMjAyMjc0LCJleHAiOjE2MjI4MjM3NzY4NDJ9.exmgjYmcObyDuzd0LDS_d_yXqkAJBNxg06-vv-14KjM";

    it("subscribe to newsletter", (done) => {
        chai
            .request(host)
            .get('/newsletter/subscribe')
            .set({ "Authorization": `Bearer ${verifiedUserToken}` })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('send Newsletter', (done) => {
       chai
           .request(host)
           .post('/newsletter/send')
           .set({ "Authorization": `Bearer ${adminToken}` })
           .send({
               "subject": "New update",
               "text": "<h2>The Campfire forum just got updated to version 1.0!</h2><br/><p>Go check out all the new features</p>"
           })
           .end(function (err, res) {
               expect(res).to.have.status(200);
               done();
           });
   });

    it("unsubscribe to newsletter", (done) => {
        chai
            .request(host)
            .get('/newsletter/unsubscribe')
            .set({ "Authorization": `Bearer ${verifiedUserToken}` })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });
});

describe("Forum structur", () => {
    let admintoken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYyMTE3NDQxMywiZXhwIjoxNjIyNzk1ODg3NTE5fQ.M-Rm9DUUIs_PzgVEV1ICDOOasVFjIgAezhSsHy6FWSk";

    it("create forum", (done) => {
       chai
           .request(host)
           .post('/forum/create')
           .set({ "Authorization": `Bearer ${admintoken}` })
           .send({
               "name": "test-forum-chai"
           })
           .end(function (err, res) {
               expect(res).to.have.status(200);
               done();
           });
   });

    it("rename forum", (done) => {
        chai
            .request(host)
            .post('/forum/rename')
            .set({ "Authorization": `Bearer ${admintoken}` })
            .send({
                "name": "test-forum-chai",
                "newName": "test-forum-chai-rename"
            })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });

    it("delete forum", (done) => {
        chai
            .request(host)
            .post('/forum/delete')
            .set({ "Authorization": `Bearer ${admintoken}` })
            .send({
                "name": "test-forum-chai-rename"
            })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });
});

describe("post structure", () => {
    let admintoken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYyMTE3NDQxMywiZXhwIjoxNjIyNzk1ODg3NTE5fQ.M-Rm9DUUIs_PzgVEV1ICDOOasVFjIgAezhSsHy6FWSk";
    let verifiedUserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjIxMjAyMjc0LCJleHAiOjE2MjI4MjM3NzY4NDJ9.exmgjYmcObyDuzd0LDS_d_yXqkAJBNxg06-vv-14KjM";

    //paste objectId here after "create post" created post
    let postId = "60a995e61c850f2512290331";

    it("create post", (done) => {
        chai
            .request(host)
            .post('/post/create')
            .set({ "Authorization": `Bearer ${admintoken}` })
            .send({
                "title": "Post title",
                "content": "Post content",
                "forumName": "Guides"
            })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });

    it("user trying to delete other users post", (done) => {
        chai
            .request(host)
            .post('/post/delete')
            .set({ "Authorization": `Bearer ${verifiedUserToken}` })
            .send({
                "postId": postId
            })
            .end(function (err, res) {
                expect(res).to.have.status(403);
                done();
            });
    });

    it("edit post", (done) => {
        chai
            .request(host)
            .post('/post/edit')
            .set({ "Authorization": `Bearer ${admintoken}` })
            .send({
                "postId": postId,
                "content": "edited post content!",
            })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });

    it("view specific post", (done) => {
        chai
            .request(host)
            .get('/post/view?postId=' + postId)
            .end(function (err, res) {
                expect(res).to.be.json
                expect(res.body).to.includes.keys(['postTitle','createdAt','postedByUserID', 'forumName', 'forumID', 'content']);
                expect(res).to.have.status(200);
                done();
            });
    });

    it("view all posts from a user", (done) => {
        chai
            .request(host)
            .post('/post/own')
            .set({ "Authorization": `Bearer ${admintoken}` })
            .end(function (err, res) {
                expect(res.body).to.be.array();
                expect(res).to.have.status(200);
                done();
            });
    });

    it( "view all posts from one forum", (done) => {
        chai
            .request(host)
            .post('/forum/posts')
            .send({
                "forumName": "Guides"
            })
            .end(function (err, res) {
                expect(res.body).to.be.array();
                expect(res).to.have.status(200);
                done();
            });
    });

    it("delete post", (done) => {
        chai
            .request(host)
            .post('/post/delete')
            .set({ "Authorization": `Bearer ${admintoken}` })
            .send({
                "postId": postId
            })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });
});

describe("comment structur", () => {
    let admintoken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYyMTE3NDQxMywiZXhwIjoxNjIyNzk1ODg3NTE5fQ.M-Rm9DUUIs_PzgVEV1ICDOOasVFjIgAezhSsHy6FWSk";
    let verifiedUserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiMiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjIxMjAyMjc0LCJleHAiOjE2MjI4MjM3NzY4NDJ9.exmgjYmcObyDuzd0LDS_d_yXqkAJBNxg06-vv-14KjM";

    it("create post", (done) => {
        chai
            .request(host)
            .post('/post/create')
            .set({ "Authorization": `Bearer ${admintoken}` })
            .send({
                "title": "comment testing post",
                "content": "This post will soon have a comment!",
                "forumName": "Guides"
            })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });

    it("create comment", (done) => {
        chai
            .request(host)
            .post('/comment/write')
            .set({ "Authorization": `Bearer ${admintoken}` })
            .send({
                "postId": "60aad5cabe1a4a429163a1c6",
                "content": "awesome post!"
            })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                done();
            });
    });

    it("view all comments from a post", (done) => {
        chai
            .request(host)
            .post('/post/comments')
            .send({
                "postId": "60aad5cabe1a4a429163a1c6"
            })
            .end(function (err, res) {
                expect(res.body).to.be.array();
                expect(res).to.have.status(200);
                done();
            })
    });

    it("user trying to delete other users comment", (done) => {
       chai
           .request(host)
           .post('/comment/delete')
           .set({ "Authorization": `Bearer ${verifiedUserToken}` })
           .send({
               "commentId": "60aad78f4c36994391239259"
           })
           .end(function (err, res) {
               expect(res).to.have.status(403);
               done();
           })
    });

    it("edit comment", (done) => {
       chai
           .request(host)
           .post('/comment/edit')
           .set({ "Authorization": `Bearer ${admintoken}` })
           .send({
               "commentId": "60aad78f4c36994391239259",
               "content": "i updated my comment!"
           })
           .end(function (err, res) {
               expect(res).to.have.status(200);
               done();
           })
    });

    it("view all own comments", (done) => {
       chai
           .request(host)
           .get('/comment/own')
           .set({ "Authorization": `Bearer ${admintoken}` })
           .end(function (err, res) {
               expect(res.body).to.be.array();
               expect(res).to.have.status(200);
               done();
           });
    });

    it("delete comment", (done) => {
        chai
            .request(host)
            .post('/comment/delete')
            .set({ "Authorization": `Bearer ${admintoken}` })
            .send({
                "commentId": "60aae3262541e348515752c8"
            })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                done();
            })
    });
});