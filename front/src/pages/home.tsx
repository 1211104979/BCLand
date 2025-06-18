import {
  Shield,
  MapPin,
  FileText,
  Users,
  Globe,
  CheckCircle,
  BarChart3,

} from "lucide-react";

export default function LandManagementDApp() {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Secure Land Registry",
      description:
        "Immutable blockchain-based land ownership records with cryptographic security",
    },
    {
      icon: <FileText className="w-8 h-8 text-green-600" />,
      title: "Digital Certificates",
      description:
        "Tamper-proof digital land certificates and ownership documents",
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Multi-Party Verification",
      description:
        "Streamlined verification process involving multiple government agencies",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
      title: "Analytics Dashboard",
      description:
        "Comprehensive insights and reporting for land management decisions",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Secure Land Ownership
              <span className="block text-blue-200">on the Blockchain</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Transparent, immutable, and efficient government land registry
              system powered by blockchain technology
            </p>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with cutting-edge blockchain technology to ensure
              transparency, security, and efficiency in land management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Transform Government Land Management
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our blockchain-based solution eliminates fraud, reduces
                processing time, and ensures complete transparency in land
                ownership records.
              </p>

              <div className="space-y-4">
                {[
                  "Eliminate fraudulent land transactions",
                  "Reduce property registration time by 80%",
                  "Provide 24/7 access to land records",
                  "Enable instant ownership verification",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
              <div className="bg-white p-6 rounded-xl shadow-sm mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500">
                    PROPERTY STATUS
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    VERIFIED
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Property ID: #LP-2024-001
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Owner: John Smith</div>
                  <div>Area: 2.5 acres</div>
                  <div>Location: Downtown District</div>
                  <div>Registered: Jan 15, 2024</div>
                </div>
              </div>

              <div className="text-center">
                <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <p className="text-blue-700 font-medium">
                  Real-time property tracking
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">GovLand</h3>
                  <p className="text-gray-400 text-sm">Blockchain Registry</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Secure, transparent, and efficient government land ownership
                management powered by blockchain technology.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Properties
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Certificates
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Reports
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    System Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 GovLand Blockchain Registry. All rights reserved. |
              Built for government transparency and efficiency.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
