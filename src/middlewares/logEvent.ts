import path from 'path'
import fs, { promises as fsPromises } from 'fs'
import { v4 as uuid } from 'uuid'
import { type Request, type Response, type NextFunction } from 'express'

export const logEvents = async (message: string, logFile: string): Promise<void> => {
  const dateTime = new Date().toISOString()
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`
  try {
    if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
      await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
    }
    await fsPromises.appendFile(
      path.join(__dirname, '..', 'logs', logFile),
      logItem
    )
  } catch (err) {
    console.error(err)
  }
}

export const logger = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await logEvents(`${req.method}\t${req.get('origin')}\t${req.url}`, 'reqLog.txt')
  console.log(`${req.method} ${req.path}`)
  next()
}
