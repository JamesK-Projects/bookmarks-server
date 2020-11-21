const express = require('express');
const xss = require('xss')
const BookmarksService = require('./bookmarks-service');

const bookmarksRouter = express.Router();
const jsonParser = express.json()


bookmarksRouter
    .route('/')
    .get((req, res, next) => {
        BookmarksService.getAllBookmarks(
            req.app.get('db')
        )
        .then(bookmarks => {
            res.json(bookmarks)
        })
        .catch(next)
    })

    .post(jsonParser, (req, res, next) => {
        const { title, url, rating, description } = req.body
        const newBookmark = { title, url, rating, description }

        for(const [key, value] of Object.entries(newBookmark)){
            if(value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        BookmarksService.insertBookmark(
            req.app.get('db'),
            newBookmark
        )
        .then(bookmark => {
            res
                .status(201)
                .location(`/bookmarks/${bookmark.id}`)
                .json(bookmark)
        })
        .catch(next)

        // if(rating < 0 || rating > 5){
        //     logger.error('Rating must be between 0 and 5')
        //     res
        //         .status(400)
        //         .send('Invalid data')
        // }
    })

bookmarksRouter
    .route('/:bookmark_id')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getById(knexInstance, req.params.bookmark_id)
            .then(bookmark => {
                if(!bookmark){
                    return res.status(404).json({
                        error: { message: `Bookmark doesn't exist` }
                    })
                }
                res.json({
                    id: bookmark.id,
                    title: xss(bookmark.title),
                    url: xss(bookmark.url),
                    rating: xss(bookmark.rating),
                    description: xss(bookmark.description),
                })
            })
            .catch(next)
    })

    // .delete((req, res) => {
    //     const { id } = req.params
    //     const bookmarkIndex = bookmarks.findIndex(b => b.id == id)

    //     if(bookmarkIndex === -1){
    //         logger.error(`Bookmark with id ${id} not found`)
    //         res
    //             .status(404)
    //             .send('Not found')
    //     }

    //     bookmarks.splice(bookmarkIndex, 1)

    //     logger.info(`Bookmark with id ${id} deleted`)

    //     res
    //         .status(201)
    //         .json(bookmarks)
    //         .end()
    // })


module.exports = bookmarksRouter