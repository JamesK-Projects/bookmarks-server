const path = require('path')
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
            res.json(bookmarks.map(bookmark => ({
                id: bookmark.id,
                title: xss(bookmark.title),
                url: xss(bookmark.url),
                rating: bookmark.rating,
                description: xss(bookmark.description)
            })))
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

        if(isNaN(newBookmark.rating)){
            return res
                .status(400)
                .json({
                    error: { message: 'Rating must be a number'}
                })
        }
        if(newBookmark.rating < 1 || newBookmark.rating > 5){
            return res
                .status(400)
                .json({
                    error: { message: 'Rating must be between 1 and 5'}
                })
        }

        BookmarksService.insertBookmark(
            req.app.get('db'),
            newBookmark
        )
        .then(bookmark => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${bookmark.id}`))
                .json({
                    id: bookmark.id,
                    title: xss(bookmark.title),
                    url: xss(bookmark.url),
                    rating: bookmark.rating,
                    description: xss(bookmark.description)
                })
        })
        .catch(next)
    })

bookmarksRouter
    .route('/:bookmark_id')
    .all((req, res, next) => {
        BookmarksService.getById(
            req.app.get('db'),
            req.params.bookmark_id
        )
        .then(bookmark => {
            if(!bookmark){
                return res.status(404).json({
                    error: { message: `Bookmark doesn't exist` }
                })
            }
            res.bookmark = bookmark
            next()
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.bookmark.id,
            title: xss(res.bookmark.title),
            url: xss(res.bookmark.url),
            rating: res.bookmark.rating,
            description: xss(res.bookmark.description),
        })
    })
    .delete((req, res, next) => {
        BookmarksService.deleteBookmark(
            req.app.get('db'),
            req.params.bookmark_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { title, url, rating, description } = req.body
        const bookmarkToUpdate = { title, url, rating, description }

        const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean).length
        if(numberOfValues === 0){
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'title', 'url', 'rating', or 'description'`
                }
            })
        }

        BookmarksService.updateBookmark(
            req.app.get('db'),
            req.params.bookmark_id,
            bookmarkToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })


module.exports = bookmarksRouter