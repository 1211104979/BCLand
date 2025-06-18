import { Users, GraduationCap, Code, Blocks, Globe, Award, BookOpen, Lightbulb } from 'lucide-react';

export default function About() {
  const students = [
    {
      name: "Ahmad Haziq bin Rahman",
      id: "1201203456",
      role: "Lead Developer & Smart Contract Architect",
      specialty: "Blockchain Development, Solidity Programming",
      avatar: "AH"
    },
    {
      name: "Lim Wei Jie",
      id: "1201203457", 
      role: "Frontend Developer & UI/UX Designer",
      specialty: "React.js, TypeScript, User Interface Design",
      avatar: "LW"
    },
    {
      name: "Priya Devi d/o Suresh",
      id: "1201203458",
      role: "Backend Developer & Database Architect", 
      specialty: "Node.js, Database Design, API Development",
      avatar: "PD"
    },
    {
      name: "Muhammad Faiz bin Ismail",
      id: "1201203459",
      role: "System Integration & Testing Lead",
      specialty: "System Testing, DevOps, Quality Assurance",
      avatar: "MF"
    }
  ];

  const technologies = [
    { name: "React.js", description: "Frontend user interface framework" },
    { name: "TypeScript", description: "Type-safe JavaScript development" },
    { name: "Solidity", description: "Smart contract programming language" },
    { name: "Ethereum", description: "Blockchain platform for smart contracts" },
    { name: "Web3.js", description: "Ethereum JavaScript API" },
    { name: "Tailwind CSS", description: "Utility-first CSS framework" }
  ];

  const features = [
    {
      icon: Globe,
      title: "Decentralized Land Registry",
      description: "Immutable property records stored on blockchain"
    },
    {
      icon: Blocks,
      title: "Smart Contract Integration",
      description: "Automated property verification and transfer processes"
    },
    {
      icon: Award,
      title: "Government-Grade Security",
      description: "Enterprise-level security for sensitive land data"
    }
  ];

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

        {/* Features Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Key Features Implemented</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our blockchain-based land registration system incorporates cutting-edge technology for secure and transparent property management
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <Code className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-3xl font-bold text-gray-800">Technology Stack</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {technologies.map((tech, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="font-semibold text-gray-800 mb-2">{tech.name}</h3>
                  <p className="text-sm text-gray-600">{tech.description}</p>
                </div>
              ))}
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