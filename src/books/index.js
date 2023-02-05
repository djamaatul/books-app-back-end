const { nanoid } = require("nanoid");
const db = require('../database')

class ErrorResponse extends Error {
	constructor(message, code = 500) {
		super()
		this.message = message,
			this.code = code
	}
}

function required(r, keys) {
	keys.forEach((key) => {
		if (!r.payload[key] === undefined) throw new ErrorResponse(`Gagal menambahkan buku. Mohon isi ${key} buku`, 400)
	})
}

function next(h, error) {
	const response = h.response({
		status: 'fail',
		message: error.message
	})

	response.code(error.code || 500)

	return response
}

function response(h, data) {
	const response = h.response({
		status: 'success',
		...data,
	})

	response.code(200)

	return response
}

exports.addBook = (request, h) => {
	try {
		const { pageCount, readPage, name, year, author, summary, publisher, reading } = request.payload

		required(request, ["name", "year", "author", "summary", "publisher", "pageCount", "readPage", "reading"])

		const id = nanoid(16)
		const finished = pageCount === readPage
		const insertedAt = new Date().toISOString()
		const updatedAt = new Date().toISOString()

		if (readPage > pageCount) throw new ErrorResponse('Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount', 400)

		db.books.push({
			id,
			name,
			year,
			author,
			summary,
			publisher,
			pageCount,
			readPage,
			finished,
			reading,
			insertedAt,
			updatedAt
		})

		return response(h, {
			message: "Buku berhasil ditambahkan",
			data: {
				bookId: id
			}
		})
	} catch (error) {
		if (!error.code) return next(h, new ErrorResponse('Buku gagal ditambahkan', 500))
		return next(h, error)
	};
}

exports.getBooks = (request, h) => {
	try {

		return response(h, {
			data: {
				books: db.books
			}
		})
	} catch (error) {
		if (!error.code) return next(h, new ErrorResponse('gagal mendapatkan Book', 500))
		return next(h, error)
	}
};

exports.getBook = (request, h) => {
	try {
		const { id } = request.params

		const book = db.books.find(e => e.id === id)

		if (!book) throw new ErrorResponse("Buku tidak ditemukan", 400)

		return response(h, {
			data: {
				book
			}
		})
	} catch (error) {
		console.log(error)
		if (!error.code) return next(h, new ErrorResponse('gagal mendapatkan Book', 500))
		return next(h, error)
	}
};

exports.editBook = (request, h) => {
	try {
		const { id } = request.params;
		const { pageCount, readPage, name, year, author, summary, publisher, reading } = request.payload

		required(request, ["name", "year", "author", "summary", "publisher", "pageCount", "readPage", "reading"])

		if (readPage > pageCount) throw new ErrorResponse('Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount', 400)

		const index = db.books.findIndex((n) => n.id === id)

		if (index < 0) throw new ErrorResponse("Gagal memperbarui buku. Id tidak ditemukan")

		const updatedAt = new Date().toISOString()

		db.books[index] = {
			...db.books[index],
			pageCount, readPage, name, year, author, summary, publisher, reading, updatedAt
		}

		return response(h, {
			message: "Buku berhasil diperbarui",
			data: {
				bookId: id
			}
		})

	} catch (error) {
		console.log(error.code)
		if (!error.code) return next(h, new ErrorResponse('Buku gagal diubah', 500))
		return next(h, error)
	}
};

exports.deleteBook = (request, h) => {
	try {
		const { id } = request.params;

		const index = db.books.findIndex((n) => n.id === id)

		if (index < 0) throw new ErrorResponse("Buku gagal dihapus. Id tidak ditemukan")

		db.books.splice(index, 1)

		return response(h, {
			message: "Buku berhasil dihapus"
		})

	} catch (error) {
		if (!error.code) return next(h, new ErrorResponse('Buku menghapus', 500))
		return next(h, error)
	}
};