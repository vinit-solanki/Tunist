import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { useNavigation, useNavigate } from "react-router-dom";
import TunistLogo from '../assets/tunist-logo.png';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);

  const navItems = [
    { name: "Home", path: "/", icon: "🏠" },
    { name: "Your Music", path: "/songs", icon: "🎵" },
    { name: "Albums", path: "/albums", icon: "💿" },
    { name: "Recommendations", path: "/recommendations", icon: "👥" },
  ];

  const Songs = [
    { name: "Song 1", minutes: 12, color: "from-pink-500 to-purple-500" },
    { name: "Song 2", minutes: 8, color: "from-purple-500 to-blue-500" },
    { name: "Song 3", minutes: 15, color: "from-blue-500 to-cyan-500" },
    { name: "Song 4", minutes: 12, color: "from-pink-500 to-purple-500" },
  ];
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("https://tunist-song-service.onrender.com/api/v1/song/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch songs");
        const data = await response.json();

        // Take only the top 4 songs (latest or first 4 depending on your logic)
        setSongs(data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };

    fetchSongs();
  }, []);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        isOpen
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-black text-white p-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          {isOpen? "Tunist": ""}
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-2xl text-white"
        >
          {isOpen ? <HiX /> : <HiMenuAlt3 />}
        </button>
      </div>

      {/* Optional Backdrop on Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden transition-all smooth duration-250"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div
        ref={sidebarRef}
        className={`${
          isOpen ? "block" : "hidden"
        } lg:block fixed lg:static top-0 left-0 h-full w-64 bg-black z-50 transition-all duration-300`}
      >
        {/* Logo */}
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-2">
            <img src={TunistLogo} className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center"/>
            <span className="text-white text-2xl font-bold">Tunist</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="px-6 flex-1 overflow-y-auto">
          <div className="mb-8">
            <h3 className="text-gray-400 text-xs font-semibold mb-4 uppercase tracking-wider">
              Discover
            </h3>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      location.pathname === item.path
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
              <Link to="/upload-form">
            <button className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white cursor-pointer p-3 rounded-lg text-xs font-semibold uppercase tracking-wider">
              + Upload Your Music
            </button>
             </Link>
          </div>
          {/* Recently Played */}
          <div className="mb-4">
            <h3 className="text-gray-400 text-xs font-semibold mb-4 uppercase tracking-wider">
              My Music
            </h3>
            <ul className="space-y-2">
              {songs.map((song, index) => (
                <li key={index}>
                <div onClick={()=>navigate(`/album/${song.album_id}`)} className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer transition-colors">
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">{song.title}</div>
                    <div className="text-xs text-gray-400">From album #{song.album_id}</div>
                  </div>
                </div>
              </li>
              
              ))}
            </ul>
          </div>
        </nav>

        {/* Footer / Auth Buttons */}
        <div className="p-6">
          {user ? (
            <div className="space-y-2">
              <button
                onClick={logout}
                className="w-full bg-gray-800 text-white py-2 px-4 rounded-full font-medium hover:bg-gray-700 transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="block w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-full text-center font-medium hover:from-green-600 hover:to-blue-700 transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
