import {
  describe,
  expect,
  vi,
  type MockInstance,
  beforeEach,
  afterAll,
  it
} from 'vitest'
import * as main from '../src/main'
import * as core from '@actions/core'
import { unlink as unlinkAsync, rmdir as rmdirAsync } from 'fs/promises'
import { join, format } from 'path'

const PDF_URL =
  'https://file-examples.com/storage/fed61549c865b2b5c9768b5/2017/10/file-sample_150kB.pdf'
const PDF_FILE_NAME = 'custom_pdf.pdf'

const MP4_URL =
  'https://file-examples.com/storage/fed61549c865b2b5c9768b5/2017/04/file_example_MP4_480_1_5MG.mp4'
const MP4_FILE_NAME = 'custom_mp4.mp4'

const XLSX_URL =
  'https://file-examples.com/storage/fed61549c865b2b5c9768b5/2017/02/file_example_XLSX_10.xlsx'
const XLSX_FILE_NAME = 'custom_xlsx.xlsx'

const CUSTOM_ROOT = './custom'
const CUSTOM_PATH = join(CUSTOM_ROOT, '/path')

const runMock = vi.spyOn(main, 'run')

let infoMock: MockInstance
let debugMock: MockInstance
let errorMock: MockInstance
let getInputMock: MockInstance
let setFailedMock: MockInstance
let setOutputMock: MockInstance

describe('fetch-file-action', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    infoMock = vi.spyOn(core, 'info').mockImplementation((str: string) => {
      console.log(`[INFO]: ${str}`)
    })
    debugMock = vi.spyOn(core, 'debug').mockImplementation((str: string) => {
      console.log(`[DEBUG]: ${str}`)
    })
    errorMock = vi.spyOn(core, 'error')
    getInputMock = vi.spyOn(core, 'getInput')
    setFailedMock = vi.spyOn(core, 'setFailed')
    setOutputMock = vi.spyOn(core, 'setOutput')
  })

  afterAll(async () => {
    vi.clearAllMocks()
    // remove downloaded files
    await Promise.all([
      unlinkAsync(PDF_FILE_NAME),
      unlinkAsync(MP4_FILE_NAME),
      unlinkAsync(XLSX_FILE_NAME),
      unlinkAsync(
        format({
          dir: CUSTOM_PATH,
          base: PDF_FILE_NAME
        })
      )
    ])
    // remove custom path
    rmdirAsync(CUSTOM_PATH)
    rmdirAsync(CUSTOM_ROOT)
  })

  /**
   * PASS CASES
   */

  it('downloads .pdf successfully', async () => {
    getInputMock.mockImplementation((name: string) => {
      switch (name) {
        case 'url':
          return PDF_URL
        case 'filename':
          return PDF_FILE_NAME
        case 'path':
          return main.DEFAULT_PATH
        default:
          return ''
      }
    })
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(setOutputMock).toHaveBeenCalledWith('success', true)
  })

  it('downloads .mp4 successfully', async () => {
    getInputMock.mockImplementation((name: string) => {
      switch (name) {
        case 'url':
          return MP4_URL
        case 'filename':
          return MP4_FILE_NAME
        case 'path':
          return main.DEFAULT_PATH
        default:
          return ''
      }
    })
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(setOutputMock).toHaveBeenCalledWith('success', true)
  })

  it('downloads .xlsx successfully', async () => {
    getInputMock.mockImplementation((name: string) => {
      switch (name) {
        case 'url':
          return XLSX_URL
        case 'filename':
          return XLSX_FILE_NAME
        case 'path':
          return main.DEFAULT_PATH
        default:
          return ''
      }
    })
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(setOutputMock).toHaveBeenCalledWith('success', true)
  })

  it('downloads file to custom path successfully', async () => {
    getInputMock.mockImplementation((name: string) => {
      switch (name) {
        case 'url':
          return PDF_URL
        case 'filename':
          return PDF_FILE_NAME
        case 'path':
          return CUSTOM_PATH
        default:
          return ''
      }
    })
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(setOutputMock).toHaveBeenCalledWith('success', true)
  })

  /**
   * FAIL CASES
   */

  it('fails if url is not provided', async () => {
    getInputMock.mockImplementation((name: string) => {
      switch (name) {
        case 'url':
          return ''
        case 'filename':
          return 'file.pdf'
        case 'path':
          return main.DEFAULT_PATH
        default:
          return ''
      }
    })
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalledWith(main.URL_ERROR_MSG)
  })

  it('fails if filename is not provided', async () => {
    getInputMock.mockImplementation((name: string) => {
      switch (name) {
        case 'url':
          return PDF_URL
        case 'filename':
          return ''
        case 'path':
          return main.DEFAULT_PATH
        default:
          return ''
      }
    })
    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalledWith(main.FILE_NAME_ERROR_MSG)
  })
})
