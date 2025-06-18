// src/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { getUserMetadata } from './lib/contracts'


interface AuthContextType {
  address: string | null
  userName: string | null   // 「john doe」 のように firstName + lastName を入れる
  userRole: string | null   // JSON に "role" フィールドがあれば入れる（なければ null）
  userNric: string | null   // JSON に "nric" フィールドがあれば入れる
  login: (addr: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  address: null,
  userName: null,
  userRole: null,
  userNric: null,
  login: async () => {},
  logout: () => {}
})

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userNric, setUserNric] = useState<string | null>(null)

  // ローカルストレージに保存されたアドレスがあれば復元
  useEffect(() => {
    const stored = localStorage.getItem('walletAddress')
    if (stored) {
      setAddress(stored)
    }
  }, [])

  // address が変わったらメタデータを取得して state 更新
  useEffect(() => {
    if (!address) {
      setUserName(null)
      setUserRole(null)
      setUserNric(null)
      return
    }

    const fetchMetadata = async () => {
      try {
        const meta = await getUserMetadata(address)
        // fullName
        const fullName = `${meta.firstName ?? ''} ${meta.lastName ?? ''}`.trim()
        setUserName(fullName || null)
        // role
        setUserRole(meta.role ?? null)
        // nric
        setUserNric(meta.icNumber ?? null)
      } catch {
        setUserName(null)
        setUserRole(null)
        setUserNric(null)
      }
    }

    fetchMetadata()
  }, [address])

  const login = async (addr: string) => {
    setAddress(addr)
    localStorage.setItem('walletAddress', addr)
    try {
      const meta = await getUserMetadata(addr)
      const fullName = `${meta.firstName ?? ''} ${meta.lastName ?? ''}`.trim()
      setUserName(fullName || null)
      setUserRole(meta.role ?? null)
      setUserNric(meta.nric ?? null)
    } catch {
      setUserName(null)
      setUserRole(null)
      setUserNric(null)
    }
  }

  const logout = () => {
    setAddress(null)
    setUserName(null)
    setUserRole(null)
    setUserNric(null)
    localStorage.removeItem('walletAddress')
  }

  return (
    <AuthContext.Provider
      value={{ address, userName, userRole, userNric, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
