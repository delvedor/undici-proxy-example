'use strict'

const assert = require('assert')
const utils = require('./utils')
const { kSocket } = require('undici/lib/core/symbols')
const { Client } = require('undici')

/**
 * NOTE: to make this works, the path validation of undici should be disabled.
 *       Open `node_modules/undici/lib/core/request` and comment the path check.
 */

async function run () {
  const server = await utils.createServer()
  const proxy = await utils.createProxy()

  const client = new Client(`http://localhost:${proxy.address().port}`)
  const conn = await client.connect({ path: `localhost:${server.address().port}` })
  assert(conn.statusCode === 200)
  console.log('got socket')
  client[kSocket] = conn.socket

  const data = await client.request({ method: 'GET', path: '/' })
  const {
    statusCode,
    headers,
    body
  } = data

  console.log('response received', statusCode)
  console.log('headers', headers)

  body.setEncoding('utf8')
  body.on('data', console.log)

  client.close()
  server.close()
  proxy.close()
}

run().catch(err => {
  console.log(err)
  process.exit(1)
})
