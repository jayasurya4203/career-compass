import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Layout/Navbar'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import CareerTest from './pages/CareerTest'
import ResumeCheck from './pages/ResumeCheck'

function App() {
  const isAuthenticated = !!localStorage.getItem('token')

  return (
    <div className="min-h-screen w-full flex flex-col">
      {isAuthenticated && <Navbar />}
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/test" element={isAuthenticated ? <CareerTest /> : <Navigate to="/login" />} />
          <Route path="/resume" element={isAuthenticated ? <ResumeCheck /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
