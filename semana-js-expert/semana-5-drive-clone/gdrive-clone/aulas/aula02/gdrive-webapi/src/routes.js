import { StatusCodes } from 'http-status-codes'
import FileHelper from './fileHelper.js'
import { logger } from './logger.js'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultDownloadsFolder = resolve(__dirname, '../', 'downloads')

export default class Routes {
  constructor(downloadsFolder = defaultDownloadsFolder) {
    this.downloadsFolder = downloadsFolder
    this.fileHelper = FileHelper
  }

  setSocketInstance(io) {
    this.io = io
  }

  async defaultRoute(req, res) {
    res.end('default')
  }

  async options(req, res) {
    res.writeHead(StatusCodes.NO_CONTENT)
    res.end('options')
  }

  async post(req, res) {
    logger.info('post')
    res.end()
  }

  async get(req, res) {
    const files = await this.fileHelper.getFilesStatus(this.downloadsFolder)

    res.writeHead(StatusCodes.OK)
    res.end(JSON.stringify(files))
  }

  handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    const chosen = this[req.method.toLowerCase()] || this.defaultRoute

    return chosen.apply(this, [req, res])
  }
}