const express = require('express');
const logger = require('../logger');
const { v4: uuid } = require('uuid')
const { bookmarks } = require('../store')

const bookmarksRouter = express.Router();
const bodyParser = express.json()


bookmarksRouter
    .route('/bookmarks')

    .get((req, res) => {
        res
            .json(bookmarks)
    })

    .post(bodyParser, (req, res) => {
        console.log(req.body)
        const { title, url, rating, description } = req.body
        
        if(!title){
            logger.error('Title is required')
            res
                .status(400)
                .send('Invalid data')
        }
        if(!url){
            logger.error('Url is required')
            res
                .status(400)
                .send('Invalid data')
        }
        if(!rating){
            logger.error('Rating is required')
            res
                .status(400)
                .send('Invalid data')
        }
        if(rating < 0 || rating > 5){
            logger.error('Rating must be between 0 and 5')
            res
                .status(400)
                .send('Invalid data')
        }
        if(!description){
            logger.error('Description is required')
            res
                .status(400)
                .send('Invalid data')
        }

        const id = uuid();
        console.log(id)
        const bookmark = {
            id,
            title,
            url,
            rating,
            description
        }
        bookmarks.push(bookmark);

        logger.info(`Bookmark with id ${id} created`)

        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${id}`)
            .json(bookmarks)
    })

bookmarksRouter
    .route('/bookmarks/:id')

    .get((req, res) => {
        const { id } = req.params
        const bookmark = bookmarks.find(b => b.id == id)

        if(!bookmark){
            logger.error(`Bookmark with id ${id} not found`)
            res
                .status(404)
                .send('Bookmark not found')
        }
        res.json(bookmark)
    })

    .delete((req, res) => {
        const { id } = req.params
        const bookmarkIndex = bookmarks.findIndex(b => b.id == id)

        if(bookmarkIndex === -1){
            logger.error(`Bookmark with id ${id} not found`)
            res
                .status(404)
                .send('Not found')
        }

        bookmarks.splice(bookmarkIndex, 1)

        logger.info(`Bookmark with id ${id} deleted`)

        res
            .status(201)
            .json(bookmarks)
            .end()
    })


module.exports = bookmarksRouter