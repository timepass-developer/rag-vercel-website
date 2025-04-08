import payload from 'payload'
import { Payload } from 'payload'
import { ExtendedInitOptions } from '../types/payload'

// Import default export from payload config
import payloadConfig from '../payload.config'

declare global {
  // eslint-disable-next-line no-var
  var __payload: Payload | undefined
}

/**
 * This utility ensures we have a single instance of Payload
 * throughout the application lifecycle
 */
export const getPayload = async (): Promise<Payload> => {
  // Return cached instance if available
  if (global.__payload) {
    return global.__payload
  }

  try {
    // In server-side code, initialize Payload
    if (typeof window === 'undefined') {
      // If Payload is already initialized, return it
      if ((payload as any)._initialized || (payload as any).initialized) {
        return payload
      }

      const initOptions: ExtendedInitOptions = {
        secret: process.env.PAYLOAD_SECRET || '',
        local: true,
        config: payloadConfig,
      }

      await payload.init(initOptions)

      global.__payload = payload
      return payload
    } else {
      // In client-side code, provide a mock or fetch data through API
      throw new Error('Payload CMS can only be accessed server-side')
    }
  } catch (error) {
    console.error('Error initializing Payload:', error)

    // Return a mock implementation for client-side or failed initialization
    return {
      find: async () => ({ docs: [], totalDocs: 0, page: 1, totalPages: 1, limit: 10 }),
      findByID: async () => ({}),
      create: async () => ({}),
      update: async () => ({}),
      delete: async () => ({}),
    } as unknown as Payload
  }
}