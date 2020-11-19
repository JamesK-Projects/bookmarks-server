function makeBookmarksArray() {
    return [
        {
            id: 1,
            title: 'Title 1',
            url: 'titleone.com',
            rating: 1,
            description: 'Lorem Ipsum 1'
        },
        {
            id: 2,
            title: 'Title 2',
            url: 'titletwo.com',
            rating: 2,
            description: 'Lorem Ipsum 2'
        },
        {
            id: 3,
            title: 'Title 3',
            url: 'titlethree.com',
            rating: 3,
            description: 'Lorem Ipsum 3'
        },
        {
            id: 4,
            title: 'Title 4',
            url: 'titlefour.com',
            rating: 4,
            description: 'Lorem Ipsum 4'
        }
    ];
}

module.exports = {
    makeBookmarksArray,
}