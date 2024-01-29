import * as core from '@actions/core'
// import fetch from 'node-fetch';
import fetch from 'node-fetch'
import fs from 'fs'
import { format as formatPath } from 'path'

export const URL_ERROR_MSG = 'url is required'
export const FILE_NAME_ERROR_MSG = 'filename is required'
export const DEFAULT_PATH = './'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Get inputs
    const url = core.getInput('url')
    core.debug(`url: ${url}`)
    const filename = core.getInput('filename')
    core.debug(`filename: ${filename}`)
    const path = core.getInput('path') ?? DEFAULT_PATH
    core.debug(`path: ${path}`)

    // Validate the  inputs
    if (!url) throw new Error(URL_ERROR_MSG)
    if (!filename) throw new Error(FILE_NAME_ERROR_MSG)

    // if using a custom path, make sure the path exists
    if (path !== DEFAULT_PATH) {
      core.debug(`path is not default, creating dirs to path: ${path}`)
      core.debug(`__dirname: ${__dirname}`)
      fs.mkdir(path, { recursive: true }, err => {
        if (err) throw err
      })
    }

    core.info(
      `Downloading file at url:"${url}" to path:"${path}" as filename:"${filename}" ...`
    )

    // Fetch the file
    const response = await fetch(url)
    core.debug(`response.status: ${response.status}`)
    if (response.type === 'error')
      throw new Error(`Failed to download file: ${response.statusText}`)
    const arrBuffer = await response.arrayBuffer()
    const fileContents = Buffer.from(arrBuffer)
    core.info('File fetched ...')
    // Writing file
    fs.writeFileSync(
      formatPath({
        dir: path,
        base: filename
      }),
      fileContents,
      {
        flush: true
      }
    )
    core.info('Writing file ...')
    // Set outputs for other workflow steps to use
    core.setOutput('success', true)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
