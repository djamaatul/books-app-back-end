const hapi = require('@hapi/hapi')
const routes = require('./routes')
require('dotenv').config()

function main() {
	const server = hapi.server({
		host: process.env.HOST,
		port: process.env.PORT,
		routes: {
			cors: {
				origin: ['*'],
			}
		}
	})

	server.route(routes)

	server.start()
	console.log(`SERVER LISTENING ON ${server.info.uri}`)
}

main()