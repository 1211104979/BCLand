// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/home';
import About from './pages/about';
import Service from './pages/service';
import Login from './pages/login';
import Register from './pages/register';
import Property from './pages/user/property'
// AuthProvider をインポート
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <AuthProvider>
      <Navbar userRole="user" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/service" element={<Service />} />
        <Route path="/user/properties" element={<Property />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
