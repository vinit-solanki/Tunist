"use client"

import { useState, useEffect } from "react"

function Admin() {
  const [activeTab, setActiveTab] = useState("albums")
  const [albums, setAlbums] = useState([])
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAlbums()
    fetchSongs()
  }, [])

  const fetchAlbums = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/v1/album/all")
      if (response.ok) {
        const data = await response.json()
        setAlbums(data)
      }
    } catch (error) {
      console.error("Error fetching albums:", error)
    }
  }

  const fetchSongs = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/v1/song/all")
      if (response.ok) {
        const data = await response.json()
        setSongs(data)
      }
    } catch (error) {
      console.error("Error fetching songs:", error)
    }
  }

  const handleCreateAlbum = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.target)
    const token = localStorage.getItem("token")

    try {
      const response = await fetch("http://localhost:4000/api/v1/album/new", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        fetchAlbums()
        e.target.reset()
      }
    } catch (error) {
      console.error("Error creating album:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSong = async (e) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.target)
    const token = localStorage.getItem("token")

    try {
      const response = await fetch("http://localhost:4000/api/v1/song/new", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        fetchSongs()
        e.target.reset()
      }
    } catch (error) {
      console.error("Error creating song:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAlbum = async (id) => {
    const token = localStorage.getItem("token")

    try {
      const response = await fetch(`http://localhost:4000/api/v1/album/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchAlbums()
        fetchSongs()
      }
    } catch (error) {
      console.error("Error deleting album:", error)
    }
  }

  const handleDeleteSong = async (id) => {
    const token = localStorage.getItem("token")

    try {
      const response = await fetch(`http://localhost:4000/api/v1/song/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchSongs()
      }
    } catch (error) {
      console.error("Error deleting song:", error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-white/60 text-lg">Manage your music content</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-white/10 backdrop-blur-sm rounded-2xl p-1 border border-white/20 w-fit">
        <button
          onClick={() => setActiveTab("albums")}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            activeTab === "albums"
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          Manage Albums
        </button>
        <button
          onClick={() => setActiveTab("songs")}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            activeTab === "songs"
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          Manage Songs
        </button>
      </div>

      {activeTab === "albums" && (
        <div className="space-y-8">
          {/* Create Album Form */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              Create New Album
            </h3>

            <form onSubmit={handleCreateAlbum} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-white font-medium text-sm">Album Title</label>
                  <input
                    name="title"
                    required
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                    placeholder="Enter album title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-white font-medium text-sm">Album Cover</label>
                  <input
                    name="thumbnail"
                    type="file"
                    accept="image/*"
                    required
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-white font-medium text-sm">Description</label>
                <textarea
                  name="description"
                  required
                  rows="4"
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 resize-none"
                  placeholder="Enter album description"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  "Create Album"
                )}
              </button>
            </form>
          </div>

          {/* Albums List */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Existing Albums</h3>
            <div className="space-y-4">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className="flex items-center justify-between p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={album.thumbnail || "/placeholder.svg"}
                      alt={album.title}
                      className="w-16 h-16 rounded-xl object-cover shadow-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-white text-lg">{album.title}</h4>
                      <p className="text-white/60">{album.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAlbum(album.id)}
                    className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 hover:text-red-300 p-3 rounded-xl transition-all duration-200"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "songs" && (
        <div className="space-y-8">
          {/* Create Song Form */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              Add New Song
            </h3>

            <form onSubmit={handleCreateSong} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-white font-medium text-sm">Song Title</label>
                  <input
                    name="title"
                    required
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                    placeholder="Enter song title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-white font-medium text-sm">Album</label>
                  <select
                    name="album"
                    required
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                  >
                    <option value="" className="bg-slate-800">
                      Select album
                    </option>
                    {albums.map((album) => (
                      <option key={album.id} value={album.id} className="bg-slate-800">
                        {album.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-white font-medium text-sm">Description</label>
                <textarea
                  name="description"
                  required
                  rows="4"
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 resize-none"
                  placeholder="Enter song description"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-white font-medium text-sm">Audio File</label>
                <input
                  name="thumbnail"
                  type="file"
                  accept="audio/*"
                  required
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Adding...</span>
                  </div>
                ) : (
                  "Add Song"
                )}
              </button>
            </form>
          </div>

          {/* Songs List */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Existing Songs</h3>
            <div className="space-y-4">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={song.thumbnail || "/placeholder.svg?height=64&width=64"}
                      alt={song.title}
                      className="w-16 h-16 rounded-xl object-cover shadow-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-white text-lg">{song.title}</h4>
                      <p className="text-white/60">{song.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSong(song.id)}
                    className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 hover:text-red-300 p-3 rounded-xl transition-all duration-200"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
