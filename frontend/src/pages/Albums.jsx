"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

function Albums() {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchAlbums()
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
    } finally {
      setLoading(false)
    }
  }

  const filteredAlbums = albums.filter(
    (album) =>
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-pink-500 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <p className="text-white/80 font-medium">Loading albums...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Albums</h1>
          <p className="text-white/60 text-lg">Discover amazing music collections</p>
        </div>

        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
          />
        </div>
      </div>

      {/* Albums Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredAlbums.map((album) => (
          <Link
            key={album.id}
            to={`/albums/${album.id}`}
            className="group bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-105"
          >
            <div className="relative mb-4">
              <img
                src={album.thumbnail || "/placeholder.svg"}
                alt={album.title}
                className="w-full aspect-square object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <button className="absolute bottom-3 right-3 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <svg className="h-5 w-5 text-white ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15"
                  />
                </svg>
              </button>
            </div>
            <h3 className="font-semibold text-white truncate mb-1">{album.title}</h3>
            <p className="text-sm text-white/60 truncate">{album.description}</p>
          </Link>
        ))}
      </div>

      {filteredAlbums.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-12 w-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No albums found</h3>
          <p className="text-white/60">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  )
}

export default Albums
