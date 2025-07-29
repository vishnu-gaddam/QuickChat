import React, { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import bgImage from './assets/bgImage.svg';
import { Toaster } from "react-hot-toast";
import { AuthContext } from '../context/AuthContext';

const App = () => {
  const { authUsers } = useContext(AuthContext); // ✅ Fixed here

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <Toaster />
      <Routes>
        <Route path="/" element={authUsers ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUsers ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUsers ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
};

export default App;
