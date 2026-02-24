/**
 * Logger utility that only logs in development mode
 * Prevents console statements from appearing in production
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },

  warn: (...args: any[]) => {
    // Always show warnings
    console.warn(...args)
  },

  error: (...args: any[]) => {
    // Always show errors
    console.error(...args)
  },

  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  },

  table: (data: any) => {
    if (isDevelopment) {
      console.table(data)
    }
  },
}

export default logger
