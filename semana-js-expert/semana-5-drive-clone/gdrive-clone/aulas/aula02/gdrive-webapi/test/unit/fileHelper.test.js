import { describe, test, expect, jest } from '@jest/globals'
import fs from 'fs'
import FileHelper from '../../src/fileHelper'

describe('#FileHelper test suite', () => {
  describe('#getFileStatus', () => {
    test('it should return file statuses with correct format', async () => {
      const statMock = {
        dev: 2049,
        mode: 33204,
        nlink: 1,
        uid: 1000,
        gid: 1000,
        rdev: 0,
        blksize: 4096,
        ino: 657198,
        size: 129600,
        blocks: 256,
        atimeMs: 1631475181656.683,
        mtimeMs: 1631475180728.6833,
        ctimeMs: 1631475180728.6833,
        birthtimeMs: 1631475180720.6833,
        atime: '2021-09-12T19:33:01.657Z',
        mtime: '2021-09-12T19:33:00.729Z',
        ctime: '2021-09-12T19:33:00.729Z',
        birthtime: '2021-09-12T19:33:00.721Z'
      }

      const mockUser = 'olaviolacerda'
      process.env.USER = mockUser
      const filename = 'file.jpg'

      jest.spyOn(fs.promises, fs.promises.readdir.name)
        .mockResolvedValue([filename])

      jest.spyOn(fs.promises, fs.promises.stat.name)
        .mockResolvedValue(statMock)

      const result = await FileHelper.getFilesStatus('/tmp')

      const expectedResult = [
        {
          size: '130 kB',
          lastModified: statMock.birthtime,
          owner: mockUser,
          file: filename
        }
      ]

      expect(fs.promises.stat).toHaveBeenCalledWith(`/tmp/${filename}`)
      expect(result).toMatchObject(expectedResult)
    })
  })
})