import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Compass, User, FileText, LogOut, LayoutDashboard } from 'lucide-react'

const Navbar = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
    window.location.reload()
  }

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-primary font-bold text-xl">
          <Compass className="w-8 h-8" />
          <span>Career Compass</span>
        </Link>
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-1 text-gray-600 hover:text-primary transition">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link to="/profile" className="flex items-center space-x-1 text-gray-600 hover:text-primary transition">
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Link>
          <Link to="/resume" className="flex items-center space-x-1 text-gray-600 hover:text-primary transition">
            <FileText className="w-5 h-5" />
            <span>Resume ATS</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-1 text-red-500 hover:text-red-700 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
