import { beforeEach, describe, test, expect, jest } from "@jest/globals"
import UploadHandler from "../../src/uploadHandler.js"
import TestUtil from "../_util/testUtil.js"
import { logger } from "../../src/logger.js"

import fs from 'fs'
import { resolve } from "path"
import { pipeline } from "stream/promises"

describe('#UploadHandler test suite', () => {
  const ioObj = {
    to: id => ioObj,
    emit: (event, message) => { }
  }

  beforeEach(() => {
    jest.spyOn(logger, 'info')
      .mockImplementation()
  })

  describe('#registerEvents', () => {
    test('should call onFile and onFinish functions on Busboy instance', () => {
      const uploadHandler = new UploadHandler({
        io: ioObj,
        socketId: '01'
      })

      jest.spyOn(uploadHandler, uploadHandler.onFile.name)
        .mockResolvedValue()

      const headers = {
        'content-type': 'multipart/form-data; boundary='
      }

      const onFinish = jest.fn()
      const busboyInstance = uploadHandler.registerEvents(headers, onFinish)

      const fileStream = TestUtil.generateReadableStream()
      busboyInstance.emit('file', 'fieldname', fileStream, 'filename.txt')

      busboyInstance.listeners('finish')[0].call()

      expect(uploadHandler.onFile).toHaveBeenCalled()
      expect(onFinish).toHaveBeenCalled()
    })
  })

  describe('#onFile', () => {
    test('given a stream file it should save it on disk', async () => {
      const chunks = ['hey', 'dude']
      const downloadsFolder = '/tmp'
      const uploadHandler = new UploadHandler({
        io: ioObj,
        socketId: '1',
        downloadsFolder
      })

      const onData = jest.fn()
      jest.spyOn(fs, fs.createWriteStream.name)
        .mockImplementation(() => TestUtil.generateWritableStream(onData))

      const onTransform = jest.fn()
      jest.spyOn(uploadHandler, uploadHandler.handleFileBytes.name)
        .mockImplementation(() => TestUtil.generateTransformStream(onTransform))

      const params = {
        fieldname: 'video',
        file: TestUtil.generateReadableStream(chunks),
        filename: 'mockFile.mov'
      }
      await uploadHandler.onFile(...Object.values(params))

      expect(onData.mock.calls.join()).toEqual(chunks.join())
      expect(onTransform.mock.calls.join()).toEqual(chunks.join())

      const expectFilename = resolve(uploadHandler.downloadsFolder, params.filename)
      expect(fs.createWriteStream).toHaveBeenCalledWith(expectFilename)
    })
  })

  describe('#handleFileBytes', () => {
    test('should call emit function and it is a transform stream', async () => {
      jest.spyOn(ioObj, ioObj.to.name)
      jest.spyOn(ioObj, ioObj.emit.name)

      const uploadHandler = new UploadHandler({
        io: ioObj,
        socketId: '01'
      })

      jest.spyOn(uploadHandler, uploadHandler.canExecute.name)
        .mockReturnValueOnce(true)

      const messages = ['hello']
      const source = TestUtil.generateReadableStream(messages)
      const onWrite = jest.fn()
      const target = TestUtil.generateWritableStream(onWrite)

      await pipeline(
        source,
        uploadHandler.handleFileBytes('filename.txt'),
        target
      )

      expect(ioObj.to).toHaveBeenCalledTimes(messages.length)
      expect(ioObj.emit).toHaveBeenCalledTimes(messages.length)

      // se o handleFileBytes for transform stream, nosso pipeline
      // vai continuar o processo passando os dados para frente
      // e chamar nossa funcao no target a cada chunk
      expect(onWrite).toBeCalledTimes(messages.length)
      expect(onWrite.mock.calls.join()).toEqual(messages.join())
    })

    test('given message timerDelay as 2 secs it should emit only two message during 2 seconds period', async () => {
      jest.spyOn(ioObj, ioObj.emit.name)

      const day = '2021-07-01 01:01'
      const twoSecondsPeriod = 2000
      // Date.now do this.lastMessageSent em handleBytes
      const onFirstLastMessageSent = TestUtil.getTimeFromDate(`${day}:00`)

      // -> hello chegou
      const onFirstCanExecute = TestUtil.getTimeFromDate(`${day}:02`)
      const onSecondUpdateLastMessageSent = onFirstCanExecute

      // -> segundo hello esta fora da janela de tempo
      const onSecondCanExecute = TestUtil.getTimeFromDate(`${day}:03`)

      // -> world chegou
      const onThirdCanExecute = TestUtil.getTimeFromDate(`${day}:04`)

      TestUtil.mockDateNow(
        [
          onFirstLastMessageSent,
          onFirstCanExecute,
          onSecondUpdateLastMessageSent,
          onSecondCanExecute,
          onThirdCanExecute
        ]
      )

      const messages = ['hello', 'hello', 'world']
      const filename = 'filename.avi'
      const expectedMessageSent = 2

      const source = TestUtil.generateReadableStream(messages)
      const uploadHandler = new UploadHandler({
        messageTimeDelay: twoSecondsPeriod,
        io: ioObj,
        socketId: '01'
      })

      await pipeline(
        source,
        uploadHandler.handleFileBytes(filename)
      )

      expect(ioObj.emit).toBeCalledTimes(expectedMessageSent)

      const [firstCallResult, secondCallResult] = ioObj.emit.mock.calls

      expect(firstCallResult).toEqual([uploadHandler.ON_UPLOAD_EVENT, { processedAlready: 'hello'.length, filename }])
      expect(secondCallResult).toEqual([uploadHandler.ON_UPLOAD_EVENT, { processedAlready: messages.join("").length, filename }])

    })
  })

  describe('#canExecute', () => {
    test('should return true when time is later than the specified delay', () => {
      const timeDelay = 1000
      const uploadHandler = new UploadHandler({
        io: {},
        socketId: '',
        messageTimeDelay: timeDelay
      })

      const now = TestUtil.getTimeFromDate('2021-07-01 00:00:03')
      TestUtil.mockDateNow([now])

      const lastExecution = TestUtil.getTimeFromDate('2021-07-01 00:00:00')

      const result = uploadHandler.canExecute(lastExecution)
      expect(result).toBeTruthy()
    })

    test('should return false when time isn\'t later than the specified delay', () => {
      const timeDelay = 3000
      const uploadHandler = new UploadHandler({
        io: {},
        socketId: '',
        messageTimeDelay: timeDelay
      })

      const now = TestUtil.getTimeFromDate('2021-07-01 00:00:02')
      TestUtil.mockDateNow([now])

      const lastExecution = TestUtil.getTimeFromDate('2021-07-01 00:00:01')

      const result = uploadHandler.canExecute(lastExecution)
      expect(result).toBeFalsy()
    })
  })
})