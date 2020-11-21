const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeBookmarksArray } = require('./bookmarks.fixtures')

describe('Bookmarks Endpoints', function(){
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('bookmarks').truncate())

    afterEach('cleanup', () => db('bookmarks').truncate())

    describe('GET /bookmarks', () => {
        context('given there are no bookmarks in the database', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .expect(200, [])
            })
        })

        context('given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })

            it('responds with 200 and with all of the bookmarks', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .expect(200, testBookmarks)
            })
        })
    })

    describe('GET /bookmarks/:bookmark_id', () => {
        context('given there are no bookmarks in the database', () => {
            it('responds with 404', () => {
                const bookmarkId = 123
                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .expect(404, { error: { message:`Bookmark doesn't exist`} })
            })
        })

        context('given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()

            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })

            it('responds with 200 and the specified bookmark', () => {
                const bookmarkId = 2
                const expectedBookmark = testBookmarks[bookmarkId - 1]
                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .expect(200, expectedBookmark)
                })
        })
    })

    describe.only('POST /bookmarks', () => {
        it('creates a bookmark, responding with 201 and the new bookmark', function() {
            const newBookmark = {
                title: 'Test new bookmark',
                url: 'Test new bookmark url',
                rating: 4,
                description: 'Test new bookmark description...'
            }
            return supertest(app)
                .post('/bookmarks')
                .send(newBookmark)
                .expect(201)
                .expect(res => {
                    console.log(res.body)
                    console.log(newBookmark.rating)
                    expect(res.body.title).to.eql(newBookmark.title)
                    expect(res.body.url).to.eql(newBookmark.url)
                    expect(res.body.rating).to.eql(newBookmark.rating)
                    expect(res.body.description).to.eql(newBookmark.description)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)

                })
                .then(postRes => 
                    supertest(app)
                        .get(`/bookmarks/${postRes.body.id}`)
                        .expect(postRes.body)
                )
        })

        const requiredFields = ['title', 'url', 'rating', 'description']

        requiredFields.forEach(field => {
            const newBookmark = {
                title: 'Test new bookmark',
                url: 'testnewbookmark.com',
                rating: 4,
                description: 'Test new bookmark description'
            }
            
            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newBookmark[field]

                return supertest(app)
                    .post('/bookmarks')
                    .send(newBookmark)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })
        })
    })
})
