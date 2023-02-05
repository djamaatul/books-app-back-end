// const {  } = require("./books")

const books = require("./books")

const routes = [
	{
		method: 'POST',
		path: '/books',
		handler: books.addBook,
	},
	{
		method: 'GET',
		path: '/books',
		handler: books.getBooks,
	},
	{
		method: 'GET',
		path: '/books/{id}',
		handler: books.getBook,
	},
	{
		method: 'PUT',
		path: '/books/{id}',
		handler: books.editBook,
	},
	{
		method: 'DELETE',
		path: '/books/{id}',
		handler: books.deleteBook,
	},
]

module.exports = routes