"use client"

import { NavLink } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

function Sidebar() {
  const { user } = useAuth()

  const navItems = [
    { path: "/dashboard", name: "Home", icon: "home" },
    { path: "/albums", name: "Albums", icon: "album" },
    { path: "/songs", name: "Songs", icon: "music" },
    { path: "/profile", name: "Profile", icon: "user" },
  ]

  if (user?.role === "admin") {
    navItems.push({ path: "/admin", name: "Admin", icon: "settings" })
  }

  const getIcon = (iconName) => {
    const icons = {
      home: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      ),
      album: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      ),
      music: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
        />
      ),
      user: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      ),
      settings: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
      ),
    }
    return icons[iconName]
  }

  return (
    <aside className="w-72 bg-black/20 backdrop-blur-xl border-r border-white/10">
      <div className="p-6">
        {/* Navigation */}
        <nav className="space-y-2">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Navigation</h2>
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30 shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
                        : "bg-white/10 group-hover:bg-white/20"
                    }`}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {getIcon(item.icon)}
                    </svg>
                  </div>
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
              <div className="p-2 bg-white/10 rounded-lg">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium">Liked Songs</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200">
              <div className="p-2 bg-white/10 rounded-lg">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-sm font-medium">Create Playlist</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
