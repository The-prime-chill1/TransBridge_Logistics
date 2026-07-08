import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setConnected(false)
      }
      return
    }

    const token = localStorage.getItem('tb-token')
    socketRef.current = io(import.meta.env.VITE_API_URL || '', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current.on('connect', () => setConnected(true))
    socketRef.current.on('disconnect', () => setConnected(false))

    return () => {
      socketRef.current?.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [user])

  const on = (event, handler) => socketRef.current?.on(event, handler)
  const off = (event, handler) => socketRef.current?.off(event, handler)
  const emit = (event, data) => socketRef.current?.emit(event, data)

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, on, off, emit }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
