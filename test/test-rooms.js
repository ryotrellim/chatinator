
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , should = require('should')
  , request = require('supertest')
  , app = require('../server')
  , context = describe
  , User = mongoose.model('User')
  , Room = mongoose.model('Room')
  , agent = request.agent(app)

var count

/**
 * Rooms tests
 */

describe('Rooms', function () {
  before(function (done) {
    // create a user
    var user = new User({
      email: 'foobar@example.com',
      name: 'Foo bar',
      username: 'foobar',
      password: 'foobar'
    })
    user.save(done)
  })

  describe('GET /rooms', function () {
    it('should respond with Content-Type text/html', function (done) {
      agent
      .get('/rooms')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(/Rooms/)
      .end(done)
    })
  })

  describe('GET /rooms/new', function () {
    context('When not logged in', function () {
      it('should redirect to /login', function (done) {
        agent
        .get('/rooms/new')
        .expect('Content-Type', /plain/)
        .expect(302)
        .expect('Location', '/login')
        .expect(/Moved Temporarily/)
        .end(done)
      })
    })

    context('When logged in', function () {
      before(function (done) {
        // login the user
        agent
        .post('/users/session')
        .field('email', 'foobar@example.com')
        .field('password', 'foobar')
        .end(done)
      })

      it('should respond with Content-Type text/html', function (done) {
        agent
        .get('/rooms/new')
        .expect('Content-Type', /html/)
        .expect(200)
        .expect(/New Room/)
        .end(done)
      })
    })
  })

  describe('POST /rooms', function () {
    context('When not logged in', function () {
      it('should redirect to /login', function (done) {
        request(app)
        .get('/rooms/new')
        .expect('Content-Type', /plain/)
        .expect(302)
        .expect('Location', '/login')
        .expect(/Moved Temporarily/)
        .end(done)
      })
    })

    context('When logged in', function () {
      before(function (done) {
        // login the user
        agent
        .post('/users/session')
        .field('email', 'foobar@example.com')
        .field('password', 'foobar')
        .end(done)
      })

      describe('Invalid parameters', function () {
        before(function (done) {
          Room.count(function (err, cnt) {
            count = cnt
            done()
          })
        })

        it('should respond with error', function (done) {
          agent
          .post('/rooms')
          .field('title', '')
          .field('body', 'foo')
          .expect('Content-Type', /html/)
          .expect(200)
          .expect(/Room title cannot be blank/)
          .end(done)
        })

        it('should not save to the database', function (done) {
          Room.count(function (err, cnt) {
            count.should.equal(cnt)
            done()
          })
        })
      })

      describe('Valid parameters', function () {
        before(function (done) {
          Room.count(function (err, cnt) {
            count = cnt
            done()
          })
        })

        it('should redirect to the new room page', function (done) {
          agent
          .post('/rooms')
          .field('title', 'foo')
          .field('body', 'bar')
          .expect('Content-Type', /plain/)
          .expect('Location', /\/rooms\//)
          .expect(302)
          .expect(/Moved Temporarily/)
          .end(done)
        })

        it('should insert a record to the database', function (done) {
          Room.count(function (err, cnt) {
            cnt.should.equal(count + 1)
            done()
          })
        })

        it('should save the room to the database', function (done) {
          Room
          .findOne({ title: 'foo'})
          .populate('user')
          .exec(function (err, room) {
            should.not.exist(err)
            room.should.be.an.instanceOf(Room)
            room.title.should.equal('foo')
            room.body.should.equal('bar')
            room.user.email.should.equal('foobar@example.com')
            room.user.name.should.equal('Foo bar')
            done()
          })
        })
      })
    })
  })

  after(function (done) {
    require('./helper').clearDb(done)
  })
})
