import React from "react";
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
import Sidebar from "./components/Sidebar";
import Profile from "./pages/Profile";
import Header from "./components/Header";
import Groups from "./pages/Groups";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

const App = () => {
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
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;
