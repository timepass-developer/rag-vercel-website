'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { Driver, driver, auth } from 'neo4j-driver'

interface MemgraphContextType {
  db: Driver | null
  isConnected: boolean
  error: string | null
  runQuery: (query: string, params?: Record<string, any>) => Promise<any>
}

const MemgraphContext = createContext<MemgraphContextType>({
  db: null,
  isConnected: false,
  error: null,
  runQuery: async () => null,
})

export const useMemgraph = () => useContext(MemgraphContext)

interface MemgraphProviderProps {
  children: React.ReactNode
  serverUrl: string
  username?: string
  password?: string
}

export const MemgraphProvider: React.FC<MemgraphProviderProps> = ({
  children,
  serverUrl,
  username = '',
  password = '',
}) => {
  const [db, setDb] = useState<Driver | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const connectToMemgraph = async () => {
      try {
        // Connect to Memgraph (compatible with Neo4j driver)
        const memgraphDriver = driver(
          serverUrl,
          username && password ? auth.basic(username, password) : undefined,
        )

        // Verify connection
        const session = memgraphDriver.session()
        await session.run('RETURN 1 AS result')
        session.close()

        setDb(memgraphDriver)
        setIsConnected(true)
        setError(null)
        console.log('Successfully connected to Memgraph')
      } catch (err) {
        setError(
          `Failed to connect to Memgraph: ${err instanceof Error ? err.message : String(err)}`,
        )
        setIsConnected(false)
        console.error('Memgraph connection error:', err)
      }
    }

    connectToMemgraph()

    return () => {
      if (db) {
        db.close()
      }
    }
  }, [serverUrl, username, password])

  const runQuery = async (query: string, params: Record<string, any> = {}) => {
    if (!db) {
      throw new Error('Database is not connected')
    }

    const session = db.session()
    try {
      const result = await session.run(query, params)
      return result.records.map((record) => {
        const obj: Record<string, any> = {}
        record.keys.forEach((key) => {
          obj[String(key)] = record.get(key)
        })
        return obj
      })
    } finally {
      session.close()
    }
  }

  return (
    <MemgraphContext.Provider value={{ db, isConnected, error, runQuery }}>
      {children}
    </MemgraphContext.Provider>
  )
}
