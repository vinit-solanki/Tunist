"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { usePlayer } from "../contexts/PlayerContext"

function AlbumDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [albumData, setAlbumData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { playSong, currentSong, isPlaying } = usePlayer()

  useEffect(() => {
    fetchAlbumData()
  }, [id])

  const fetchAlbumData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/album/${id}`)
      if (response.ok) {
        const data = await response.json()
        setAlbumData(data)
      }
    } catch (error) {
      console.error("Error fetching album data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-pink-500 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <p className="text-white/80 font-medium">Loading album...</p>
        </div>
      </div>
    )
  }

  if (!albumData) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="h-12 w-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Album not found</h2>
        <button
          onClick={() => navigate("/albums")}
          className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
        >
          ← Back to Albums
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/albums")}
        className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to Albums</span>
      </button>

      {/* Album Header */}
      <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
        <div className="relative group">
          <img
            src={albumData.album.thumbnail || "/placeholder.svg"}
            alt={albumData.album.title}
            className="w-64 h-64 rounded-3xl object-cover shadow-2xl"
          />
          <div className="absolute inset-0 bg-black/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <p className="text-purple-400 font-medium text-sm uppercase tracking-wider mb-2">Album</p>
            <h1 className="text-5xl font-bold text-white mb-4">{albumData.album.title}</h1>
            <p className="text-xl text-white/70 mb-6">{albumData.album.description}</p>
          </div>

          <div className="flex items-center space-x-6 text-white/60">
            <span className="flex items-center space-x-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
              <span>{albumData.songs.length} songs</span>
            </span>
            <span className="flex items-center space-x-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>45 min</span>
            </span>
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg">
              Play All
            </button>
            <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200">
              Add to Library
            </button>
          </div>
        </div>
      </div>

      {/* Songs List */}
      <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Songs</h2>
        </div>

        <div className="space-y-1 p-2">
          {albumData.songs.map((song, index) => (
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
                <svg className="h-4 w-4 text-white ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15"
                  />
                </svg>
              </button>

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
    </div>
  )
}

export default AlbumDetail
