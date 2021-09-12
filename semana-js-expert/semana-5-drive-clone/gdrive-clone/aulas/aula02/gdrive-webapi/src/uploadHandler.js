import Busboy from 'busboy'
import { pipeline } from 'stream/promises'
import fs from 'fs'
import { logger } from './logger.js'

export default class UploadHandler {
  constructor({ io, socketId, downloadsFolder }) {
    this.io = io
    this.socketId = socketId
    this.downloadsFolder = downloadsFolder
    this.ON_UPLOAD_EVENT = 'file-upload'
  }

  handleFileBytes(filename) {
    async function* handleData(source) {
      let processedAlready = 0

      for await (const chunk of source) {
        yield chunk
        processedAlready += chunk.length

        this.io.to(this.socketId)
          .emit(this.ON_UPLOAD_EVENT, { processedAlready, filename })
        logger.info(`File [${filename}] got ${processedAlready} bytes to ${this.socketId}`)

      }
    }

    return handleData.bind(this)
  }

  async onFile(fieldName, file, filename) {
    const saveTo = `${this.downloadsFolder}/${filename}`

    await pipeline(
      // pegar uma readable stream!
      file,
      // filtrar, converter, transformar dados!
      this.handleFileBytes.apply(this, [filename]),
      // saida do processo, uma writable stream!
      fs.createWriteStream(saveTo)
    )

    logger.info(`File [${filename}] finished`)
  }

  registerEvents(headers, onFinish) {
    const busboy = new Busboy({ headers })
    busboy.on('file', this.onFile.bind(this))
    busboy.on('finish', onFinish)

    return busboy
  }
}