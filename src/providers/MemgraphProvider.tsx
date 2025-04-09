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
  const [connectionAttempted, setConnectionAttempted] = useState(false)

  useEffect(() => {
    let memgraphDriver: Driver | null = null;
    
    const connectToMemgraph = async () => {
      if (connectionAttempted) return;
      
      try {
        // Only attempt connection in non-dev environments or if explicitly enabled
        if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ENABLE_MEMGRAPH) {
          console.log('Skipping Memgraph connection in development mode');
          // Provide mock implementation for development
          setIsConnected(false);
          setError('Memgraph connection disabled in development mode');
          setConnectionAttempted(true);
          return;
        }

        // Connect to Memgraph (compatible with Neo4j driver)
        memgraphDriver = driver(
          serverUrl,
          username && password ? auth.basic(username, password) : undefined,
        );

        // Test connection with a timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Connection timed out')), 3000);
        });

        const connectionPromise = async () => {
          const session = memgraphDriver!.session();
          try {
            await session.run('RETURN 1 AS result');
            return true;
          } finally {
            session.close();
          }
        };

        await Promise.race([connectionPromise(), timeoutPromise]);
        
        setDb(memgraphDriver);
        setIsConnected(true);
        setError(null);
        console.log('Successfully connected to Memgraph');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Failed to connect to Memgraph: ${errorMessage}`);
        setIsConnected(false);
        console.error('Memgraph connection error:', err);
        
        // Mock implementation when connection fails
        setDb(null);
      } finally {
        setConnectionAttempted(true);
      }
    };

    connectToMemgraph();

    return () => {
      if (memgraphDriver) {
        memgraphDriver.close();
      }
    };
  }, [serverUrl, username, password, connectionAttempted]);

  const runQuery = async (query: string, params: Record<string, any> = {}) => {
    if (!db) {
      console.log("Using mock Memgraph implementation because database is not connected");
      // Return mock data for development or when connection fails
      return [];
    }

    const session = db.session();
    try {
      const result = await session.run(query, params);
      return result.records.map((record) => {
        const obj: Record<string, any> = {};
        record.keys.forEach((key) => {
          obj[String(key)] = record.get(key);
        });
        return obj;
      });
    } finally {
      session.close();
    }
  };

  return (
    <MemgraphContext.Provider value={{ db, isConnected, error, runQuery }}>
      {children}
    </MemgraphContext.Provider>
  );
};
