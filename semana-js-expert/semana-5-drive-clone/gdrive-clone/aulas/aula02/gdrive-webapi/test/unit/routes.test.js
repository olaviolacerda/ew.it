import { beforeEach, describe, test, expect, jest } from '@jest/globals'
import { StatusCodes } from 'http-status-codes'

import TestUtil from '../_util/testUtil'
import { logger } from '../../src/logger.js'
import Routes from '../../src/routes'
import UploadHandler from '../../src/uploadHandler'

describe('#Routes test suite', () => {
  beforeEach(() => {
    jest.spyOn(logger, 'info')
      .mockImplementation()
  })

  const request = TestUtil.generateReadableStream([' some file bytes'])
  const response = TestUtil.generateWritableStream(() => { })

  const defaultParams = {
    request: Object.assign(request, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      method: '',
      body: {}
    }),

    response: Object.assign(response, {
      setHeader: jest.fn(),
      writeHead: jest.fn(),
      end: jest.fn()
    }),
    values: () => Object.values(defaultParams)
  }

  describe('#setSocketInstance', () => {
    test('setSocket should store to instance', () => {
      const routes = new Routes()
      const ioObj = {
        to: id => ioObj,
        emit: (event, message) => { }
      }

      routes.setSocketInstance(ioObj)
      expect(routes.io).toStrictEqual(ioObj)
    })
  })

  describe('#handler', () => {
    test('given an inexistent route it should choose default route', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams
      }

      params.request.method = 'inexistent'
      await routes.handler(...params.values())
      expect(params.response.end).toHaveBeenCalledWith('default')
    })

    test('it should set any request with CORS enabled', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams
      }

      params.request.method = 'inexistent'
      await routes.handler(...params.values())
      expect(params.response.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*')
    })

    test('given method OPTIONS it should choose options route', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams
      }

      params.request.method = 'OPTIONS'
      await routes.handler(...params.values())
      expect(params.response.writeHead).toHaveBeenCalledWith(StatusCodes.NO_CONTENT)
      expect(params.response.end).toHaveBeenCalled()
    })

    test('given method POST it should choose post route', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams
      }

      jest.spyOn(routes, routes.post.name).mockResolvedValue()
      params.request.method = 'POST'

      await routes.handler(...params.values())
      expect(routes.post).toHaveBeenCalled()
    })

    test('given method GET it should choose get route', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams
      }
      jest.spyOn(routes, routes.get.name).mockResolvedValue()
      params.request.method = 'GET'

      await routes.handler(...params.values())
      expect(routes.get).toHaveBeenCalled()
    })
  })

  describe('#get', () => {
    test('given method GET it should list all downloaded files', async () => {
      const routes = new Routes('/tmp')
      const params = {
        ...defaultParams
      }

      const filesStatusesMock = [
        {
          size: '130 kB',
          lastModified: '2021-09-12T19:33:00.721Z',
          owner: 'olaviolacerda',
          file: 'file.txt'
        }
      ]

      jest.spyOn(routes.fileHelper, routes.fileHelper.getFilesStatus.name)
        .mockResolvedValue(filesStatusesMock)

      params.request.method = 'GET'
      await routes.handler(...params.values())
      expect(params.response.writeHead).toHaveBeenCalledWith(StatusCodes.OK)
      expect(params.response.end).toHaveBeenCalled()
    })
  })

  describe('#post', () => {
    test('it should validate post route workflow', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams
      }
      params.request.method = 'POST'
      params.request.url = '?socketId=10'

      jest.spyOn(
        UploadHandler.prototype,
        UploadHandler.prototype.registerEvents.name
      ).mockImplementation((headers, onFinish) => {
        const writable = TestUtil.generateWritableStream(() => { })
        writable.on('finish', onFinish)

        return writable
      })

      await routes.handler(...params.values())

      expect(UploadHandler.prototype.registerEvents).toHaveBeenCalled()
      expect(params.response.writeHead).toHaveBeenCalledWith(StatusCodes.OK)

      const expectedResult = JSON.stringify({ result: 'Files uploaded with success! ' })
      expect(params.response.end).toHaveBeenCalledWith(expectedResult)
    })
  })
})
