"use client"

import { useAuth } from "../contexts/AuthContext"

function Profile() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
        <p className="text-white/60 text-lg">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <div className="max-w-2xl">
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-white font-bold text-3xl">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
              <p className="text-purple-400 font-medium capitalize mb-2">{user?.role} Member</p>
              <div className="flex items-center space-x-2 text-sm text-white/60">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}</span>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 uppercase tracking-wider">Full Name</label>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3">
                <p className="text-white font-medium">{user?.name}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 uppercase tracking-wider">Email Address</label>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3">
                <p className="text-white font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 uppercase tracking-wider">Account Type</label>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${user?.role === "admin" ? "bg-purple-500" : "bg-green-500"}`}
                  ></div>
                  <p className="text-white font-medium capitalize">{user?.role}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 uppercase tracking-wider">Status</label>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-white font-medium">Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-8 pt-6 border-t border-white/10">
            <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02]">
              Edit Profile
            </button>
            <button className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200">
              Change Password
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">247</h3>
            <p className="text-white/60 text-sm">Songs Played</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">32</h3>
            <p className="text-white/60 text-sm">Liked Songs</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">18h</h3>
            <p className="text-white/60 text-sm">Listening Time</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
