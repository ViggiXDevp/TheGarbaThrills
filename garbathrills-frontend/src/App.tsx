import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProfileSetup from './pages/ProfileSetup';
import Profile from './pages/Profile';
import SwipeDeck from './pages/SwipeDeck';
import LikesYou from './pages/LikesYou';
import Matches from './pages/Matches';
import ChatWindow from './pages/ChatWindow';
import ViewProfile from './pages/ViewProfile';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/profile-setup"
            element={
              <ProtectedRoute requireCompleteProfile={false}>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/swipe"
            element={
              <ProtectedRoute>
                <SwipeDeck />
              </ProtectedRoute>
            }
          />
          <Route
            path="/likes"
            element={
              <ProtectedRoute>
                <LikesYou />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <Matches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:matchId"
            element={
              <ProtectedRoute>
                <ChatWindow />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/user/:userId" 
            element={ 
              <ProtectedRoute> 
                <ViewProfile /> 
              </ProtectedRoute> 
            } 
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
