import { GraduationCap, Globe, BookOpen, Lightbulb } from 'lucide-react';

export default function About() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <Globe className="w-16 h-16 mr-4" />
            <h1 className="text-5xl font-bold">GovLand</h1>
          </div>
          <p className="text-xl mb-4">Malaysia Digital Land Registration System</p>
          <p className="text-lg opacity-90">A Blockchain-Powered Government DApp</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Project Overview */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-800">About This Project</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Academic Project</h3>
                <p className="text-gray-600 mb-4">
                  This project is developed as a coursework assignment for the 
                  <span className="font-semibold text-blue-600"> Blockchain and Smart Contract </span>
                  course at Multimedia University (MMU), Malaysia.
                </p>
                <p className="text-gray-600 mb-4">
                  Our team has created a comprehensive digital land registration system that demonstrates 
                  the practical application of blockchain technology in government services.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-blue-800 font-medium">
                    "Bridging the gap between traditional government services and modern blockchain technology"
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Project Objectives</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Lightbulb className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">Implement blockchain technology for transparent land records</span>
                  </li>
                  <li className="flex items-start">
                    <Lightbulb className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">Develop smart contracts for automated property transactions</span>
                  </li>
                  <li className="flex items-start">
                    <Lightbulb className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">Create a user-friendly government service interface</span>
                  </li>
                  <li className="flex items-start">
                    <Lightbulb className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">Demonstrate practical DApp development skills</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* University Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <GraduationCap className="w-12 h-12 mr-4" />
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Multimedia University</h2>
                <p className="text-red-100">Malaysia's First Private University</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Course</h3>
                <p className="text-red-100">Blockchain and Smart Contract</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Faculty</h3>
                <p className="text-red-100">Faculty of Computing and Informatics</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Academic Year</h3>
                <p className="text-red-100">2024/2025</p>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">!</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Academic Project Disclaimer</h3>
                <p className="text-yellow-700 text-sm">
                  This project is developed for educational purposes as part of our coursework at Multimedia University. 
                  It is not intended for production use and serves as a demonstration of blockchain technology applications 
                  in government services. All data used in this system is mock data for testing and demonstration purposes only.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}