import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Albums from "./pages/Albums";
import AlbumDetail from "./pages/AlbumDetail";
import Songs from "./pages/Songs";
import Player from "./components/Player";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Footer from "./components/Footer";
import Profile from "./pages/Profile";
import Header from "./components/Header";
import Groups from "./pages/Groups";
import MusicRecommendations from "./pages/MusicRecommendation";
import GroupById from "./pages/GroupById";
import UploadForm from "./pages/UploadForm";
import Admin from "./pages/Admin";
import ErrorPage from "./pages/ErrorPage";
import { useNavigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

const App = () => {
  const navigate = useNavigate();
  const AdminRoute = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(null);
    const navigate = useNavigate();

    React.useEffect(() => {
      const checkAdmin = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        try {
          const res = await fetch("https://tunist-user-service.onrender.com/api/v1/user/me", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              token: token,
            },
          });
          const data = await res.json();
          // Check both data.role and data.user.role to handle different response structures
          if (data.role === "admin" || data.user?.role === "admin") {
            setIsAdmin(true);
          } else {
            alert("Access Denied: Admin privileges required");
            navigate("/error-page");
          }
        } catch (err) {
          console.error("Admin check error:", err);
          navigate("/login");
        }
      };
      checkAdmin();
    }, [navigate]);

    if (isAdmin === null) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="text-white text-xl">Verifying admin access...</div>
        </div>
      );
    }

    return children;
  };

  return (
    <div className="min-h-screen w-full bg-gray-950 text-gray-200 overflow-x-hidden flex">
      <div className="min-h-screen">
        <Header />
      </div>
      <div className="flex flex-col flex-1 w-full ">
        <main className="flex-1">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />{" "}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/albums"
              element={
                <PrivateRoute>
                  <Albums />
                </PrivateRoute>
              }
            />
            <Route
              path="/album/:id"
              element={
                <PrivateRoute>
                  <AlbumDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/songs"
              element={
                <PrivateRoute>
                  <Songs />
                </PrivateRoute>
              }
            />
            <Route
              path="/songs/:id"
              element={
                <PrivateRoute>
                  <Player />
                </PrivateRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <PrivateRoute>
                  <Groups />
                </PrivateRoute>
              }
            />
            <Route
              path="/recommendations"
              element={
                <PrivateRoute>
                  <MusicRecommendations />
                </PrivateRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <PrivateRoute>
                  <Groups />
                </PrivateRoute>
              }
            />
            <Route
              path="/groups/:id"
              element={
                <PrivateRoute>
                  <GroupById />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/upload-form"
              element={
                <PrivateRoute>
                  <AdminRoute>
                    <UploadForm />
                  </AdminRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/error-page"
              element={
                <PrivateRoute>
                  <ErrorPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;
