"use client"

import { useState, useEffect } from "react"
import { usePlayer } from "../contexts/PlayerContext"

function Songs() {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { playSong, currentSong, isPlaying } = usePlayer()

  useEffect(() => {
    fetchSongs()
  }, [])

  const fetchSongs = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/v1/song/all")
      if (response.ok) {
        const data = await response.json()
        setSongs(data)
      }
    } catch (error) {
      console.error("Error fetching songs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-pink-500 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <p className="text-white/80 font-medium">Loading songs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">All Songs</h1>
          <p className="text-white/60 text-lg">Your complete music library</p>
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
            placeholder="Search songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
          />
        </div>
      </div>

      {/* Songs List */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        <div className="space-y-1 p-2">
          {filteredSongs.map((song, index) => (
            <div
              key={song.id}
              className={`flex items-center p-4 rounded-xl hover:bg-white/10 group cursor-pointer transition-all duration-200 ${
                currentSong?.id === song.id ? "bg-white/10 border border-purple-500/30" : ""
              }`}
              onClick={() => playSong(song)}
            >
              <div className="w-8 text-center text-white/60 group-hover:hidden font-medium">
                {currentSong?.id === song.id && isPlaying ? (
                  <div className="flex items-center justify-center">
                    <div className="flex space-x-1">
                      <div className="w-1 h-4 bg-purple-500 animate-pulse rounded-full"></div>
                      <div
                        className="w-1 h-4 bg-purple-500 animate-pulse rounded-full"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-1 h-4 bg-purple-500 animate-pulse rounded-full"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  index + 1
                )}
              </div>

              <button className="w-8 h-8 hidden group-hover:flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                {currentSong?.id === song.id && isPlaying ? (
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-white ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15"
                    />
                  </svg>
                )}
              </button>

              <img
                src={song.thumbnail || "/placeholder.svg?height=48&width=48"}
                alt={song.title}
                className="w-12 h-12 rounded-xl object-cover ml-4 shadow-md"
              />

              <div className="flex-1 ml-4 min-w-0">
                <h4
                  className={`font-semibold truncate ${currentSong?.id === song.id ? "text-purple-400" : "text-white"}`}
                >
                  {song.title}
                </h4>
                <p className="text-sm text-white/60 truncate">{song.description}</p>
              </div>

              <div className="flex items-center space-x-3">
                <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
                <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
                <span className="text-sm text-white/60 font-medium">3:24</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredSongs.length === 0 && (
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
          <h3 className="text-xl font-semibold text-white mb-2">No songs found</h3>
          <p className="text-white/60">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  )
}

export default Songs
