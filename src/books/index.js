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

function validation(type, req, cb) {
	return new Promise((res, rej) => {
		Object.entries(type).forEach(([key, value]) => {
			if (typeof req.payload[key] === value) {
				return res({
					status: 'valid'
				})
			} else {
				return res({
					key,
					value: req.payload[key],
					type: value
				})
			}
		})
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

function response(h, data, code = 200) {
	const response = h.response({
		status: 'success',
		...data,
	})

	response.code(code)

	return response
}

exports.addBook = async (request, h) => {
	try {
		const { pageCount, readPage, name, year, author, summary, publisher, reading } = request.payload

		required(request, ["name", "year", "author", "summary", "publisher", "pageCount", "readPage", "reading"])

		const valid = await validation({
			"name": 'string',
			"year": 'number',
			"author": 'string',
			"summary": 'string',
			"publisher": 'string',
			"pageCount": 'number',
			"readPage": 'number',
			"reading": 'boolean'
		}, request)

		if (valid.key) {
			return response(h, {
				message: `type ${valid.key} harus dengan ${valid.type}`
			},400)
		}

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
		},201)
	} catch (error) {
		if (!error.code) return next(h, new ErrorResponse('Buku gagal ditambahkan', 500))
		return next(h, error)
	};
}

exports.getBooks = (request, h) => {
	try {

		return response(h, {
			data: {
				books: db.books.map(({ id, name, publisher }) => ({
					id,
					name,
					publisher,
				}))
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

		if (!book) throw new ErrorResponse("Buku tidak ditemukan", 404)

		return response(h, {
			data: {
				book
			}
		})
	} catch (error) {
		if (!error.code) return next(h, new ErrorResponse('gagal mendapatkan Book', 500))
		return next(h, error)
	}
};

exports.editBook = async (request, h) => {
	try {
		const { id } = request.params;
		const { pageCount, readPage, name, year, author, summary, publisher, reading } = request.payload

		required(request, ["name", "year", "author", "summary", "publisher", "pageCount", "readPage", "reading"])

		const valid = await validation({
			"name": 'string',
			"year": 'number',
			"author": 'string',
			"summary": 'string',
			"publisher": 'string',
			"pageCount": 'number',
			"readPage": 'number',
			"reading": 'boolean'
		}, request)

		if (valid.key) {
			return response(h, {
				message: `type ${valid.key} harus dengan ${valid.type}`
			},400)
		}

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

		if (index < 0) throw new ErrorResponse("Buku gagal dihapus. Id tidak ditemukan",404)

		db.books.splice(index, 1)

		return response(h, {
			message: "Buku berhasil dihapus"
		})

	} catch (error) {
		if (!error.code) return next(h, new ErrorResponse('Buku menghapus', 500))
		return next(h, error)
	}
};