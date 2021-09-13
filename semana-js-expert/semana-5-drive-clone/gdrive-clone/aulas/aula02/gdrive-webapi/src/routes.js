import { StatusCodes } from 'http-status-codes'
import { dirname, resolve } from 'path'
import { pipeline } from 'stream/promises'
import { fileURLToPath, URL, parse } from 'url'

import FileHelper from './fileHelper.js'
import { logger } from './logger.js'
import UploadHandler from './uploadHandler.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultDownloadsFolder = resolve(__dirname, '../', 'downloads')

export default class Routes {
  constructor (downloadsFolder = defaultDownloadsFolder) {
    this.downloadsFolder = downloadsFolder
    this.fileHelper = FileHelper
    this.io = {}
  }

  setSocketInstance (io) {
    this.io = io
  }

  async defaultRoute (req, res) {
    res.end('default')
  }

  async options (req, res) {
    res.writeHead(StatusCodes.NO_CONTENT)
    res.end('options')
  }

  async post (req, res) {
    const { headers } = req
    const { query: { socketId } } = parse(req.url, true)

    const uploadHandler = new UploadHandler({
      socketId,
      io: this.io,
      downloadsFolder: this.downloadsFolder
    })

    const onFinish = response => () => {
      response.writeHead(StatusCodes.OK)
      const data = JSON.stringify({ result: 'Files uploaded with success! ' })
      response.end(data)
    }

    const busboyInstance = uploadHandler.registerEvents(
      headers,
      onFinish(res)
    )

    await pipeline(
      req,
      busboyInstance
    )

    logger.info('request finished with success!')
  }

  async get (req, res) {
    const files = await this.fileHelper.getFilesStatus(this.downloadsFolder)

    res.writeHead(StatusCodes.OK)
    res.end(JSON.stringify(files))
  }

  handler (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    const chosen = this[req.method.toLowerCase()] || this.defaultRoute

    return chosen.apply(this, [req, res])
  }
}
