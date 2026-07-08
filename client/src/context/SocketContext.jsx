import { createContext, useContext } from 'react'

// WebSocket/Socket.io has been disabled — real-time updates are handled
// via Firebase Firestore onSnapshot listeners instead.
const SocketContext = createContext({
  socket: null,
  connected: false,
  on: () => {},
  off: () => {},
  emit: () => {},
})

export function SocketProvider({ children }) {
  return (
    <SocketContext.Provider value={{ socket: null, connected: false, on: () => {}, off: () => {}, emit: () => {} }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
