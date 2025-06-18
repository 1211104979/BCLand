// src/components/Navbar.tsx
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Globe, Menu, X, User, LogOut, ChevronDown, Wallet } from 'lucide-react'
import { useAuth } from '../AuthContext'

type Role = 'admin' | 'staff' | 'user' | 'nonuser'

interface NavbarProps {
  userRole: Role
}

export default function Navbar({ userRole }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  // AuthContext から address, userName, userRole, logout を取得
  const { address, userName, userRole: ctxUserRole, logout } = useAuth()
  const navigate = useNavigate()

  // アドレスを "0x1234...abcd" 形式に切り詰めるヘルパー
  const shortenAddress = (addr: string): string => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // ログアウト時
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // 表示するナビリンクを決める
  const commonLinks = [
    { name: 'About', path: '/about' },
    { name: 'Service', path: '/service' },
  ]
  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Transaction', path: '/admin/transactions' },
    { name: 'Property', path: '/admin/properties' },
  ]
  const staffLinks = [
    { name: 'Dashboard', path: '/staff/dashboard' },
    { name: 'Transaction', path: '/staff/transactions' },
    { name: 'Property', path: '/staff/properties' },
  ]
  const userLinks = [
    { name: 'Property', path: '/user/properties' },
  ]

  const roleBasedLinks =
    userRole === 'admin'
      ? adminLinks
      : userRole === 'staff'
      ? staffLinks
      : userRole === 'user'
      ? userLinks
      : []

  const displayLinks = [...roleBasedLinks, ...commonLinks]

  // ログイン済みかどうか
  const isLoggedIn = Boolean(address)

  // AuthContext の userRole（ctxUserRole）を使う場合のラベル・カラー
  const roleConfig: Record<string, { color: string }> = {
    Administrator: { color: 'bg-red-100 text-red-800' },
    Staff:         { color: 'bg-green-100 text-green-800' },
    Citizen:       { color: 'bg-blue-100 text-blue-800' },
  }
  const roleColor = ctxUserRole ? roleConfig[ctxUserRole]?.color || '' : ''

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 m-2 rounded-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">GovLand</h2>
              <p className="text-xs text-gray-500 -mt-1">Malaysia Digital Land Registry</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            {displayLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `block px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-blue-600'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition border border-gray-200"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    {/* ここに AuthContext から取得した userName を表示 */}
                    <p className="text-sm font-medium text-gray-900">
                      {userName ?? 'Unknown User'}
                    </p>
                    <div className="flex items-center space-x-1">
                      <Wallet className="w-3 h-3 text-gray-500" />
                      <p className="text-xs text-gray-500 font-mono">
                        {shortenAddress(address || '')}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* Profile ドロップダウン */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          {/* ここにも userName */}
                          <p className="text-sm font-medium text-gray-900">
                            {userName ?? 'Unknown User'}
                          </p>
                          {/* ここに userRole (ctxUserRole) を表示 */}
                          {ctxUserRole && (
                            <span
                              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${roleColor}`}
                            >
                              {ctxUserRole}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <Wallet className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-600">Wallet Address:</span>
                        </div>
                        <p className="text-xs font-mono text-gray-800 mt-1 break-all">
                          {address}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsProfileDropdownOpen(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex gap-3">
                <NavLink
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
                >
                  Register
                </NavLink>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-500 hover:text-gray-900 p-2"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-2 space-y-2">
          {isLoggedIn && (
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex items-center space-x-3 px-3 py-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  {/* ここにも userName を表示 */}
                  <p className="text-sm font-medium text-gray-900">
                    {userName ?? 'Unknown User'}
                  </p>
                  <div className="flex items-center space-x-1">
                    <Wallet className="w-3 h-3 text-gray-500" />
                    <p className="text-xs text-gray-500 font-mono">
                      {shortenAddress(address || '')}
                    </p>
                  </div>
                  {ctxUserRole && (
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${roleColor}`}
                    >
                      {ctxUserRole}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-2 space-y-1">
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          )}

          {displayLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-blue-600'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {!isLoggedIn && (
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <NavLink
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-blue-600 font-medium text-center border border-blue-600 rounded hover:bg-blue-50 transition"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-white bg-blue-600 rounded text-center hover:bg-blue-700 transition"
              >
                Register
              </NavLink>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
