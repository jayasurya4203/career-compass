import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Brain, FileCheck, GraduationCap, ArrowRight, CheckCircle } from 'lucide-react'
import axios from 'axios'

const Dashboard = () => {
  const [recommendations, setRecommendations] = useState([])
  const [prediction, setPrediction] = useState(null)
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const config = { headers: { Authorization: `Bearer ${token}` } }
        
        // Mocking recommendation fetching
        const resRecs = await axios.get('http://localhost:5000/api/career/recommendations', config)
        setRecommendations(resRecs.data)
        
        // In a real app we'd fetch the latest prediction
      } catch (err) {
        console.error("Error fetching dashboard data", err)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username}!</h1>
        <p className="text-indigo-100 mb-6">Explore your AI-powered career recommendations and employability insights.</p>
        <Link to="/test" className="inline-flex items-center space-x-2 bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition">
          <Brain className="w-5 h-5" />
          <span>Start Career Assessment</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="bg-blue-50 p-4 rounded-full mb-4">
            <Brain className="text-blue-600 w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg mb-2">Aptitude Test</h3>
          <p className="text-gray-500 text-sm mb-4">Predict your best career path based on skills and logic.</p>
          <Link to="/test" className="text-primary font-semibold flex items-center hover:underline">
            Take Test <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="bg-green-50 p-4 rounded-full mb-4">
            <FileCheck className="text-green-600 w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg mb-2">Resume ATS Score</h3>
          <p className="text-gray-500 text-sm mb-4">Optimize your resume for your target job roles.</p>
          <Link to="/resume" className="text-primary font-semibold flex items-center hover:underline">
            Check Resume <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="bg-purple-50 p-4 rounded-full mb-4">
            <GraduationCap className="text-purple-600 w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg mb-2">Learning Roadmap</h3>
          <p className="text-gray-500 text-sm mb-4">Get personalized course and project recommendations.</p>
          <button className="text-primary font-semibold flex items-center hover:underline">
            View Roadmaps <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <GraduationCap className="mr-2 text-primary" />
          Top Recommendations for You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded mb-3 uppercase tracking-wider">
                  {rec.type}
                </span>
                <h4 className="font-bold text-lg mb-2">{rec.title}</h4>
                <p className="text-gray-600 text-sm mb-4">{rec.description}</p>
                <a href={rec.link} className="text-primary font-medium flex items-center hover:underline text-sm">
                  Learn More <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-gray-50 p-12 rounded-xl text-center border-2 border-dashed border-gray-200">
              <p className="text-gray-500">No recommendations yet. Complete your profile or take a test!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
