import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { PlayerProvider } from "./contexts/PlayerContext"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Albums from "./pages/Albums"
import Songs from "./pages/Songs"
import Profile from "./pages/Profile"
import Admin from "./pages/Admin"
import AlbumDetail from "./pages/AlbumDetail"
import Layout from "./components/Layout"
import "./App.css"

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-500 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <p className="text-white/80 font-medium">Loading Tunist...</p>
        </div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  return user && user.role === "admin" ? children : <Navigate to="/dashboard" />
}

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/albums"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Albums />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/albums/:id"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AlbumDetail />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/songs"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Songs />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <Layout>
                        <Admin />
                      </Layout>
                    </AdminRoute>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </PlayerProvider>
    </AuthProvider>
  )
}

export default App
