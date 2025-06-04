"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { usePlayer } from "../contexts/PlayerContext"

function Dashboard() {
  const [recentAlbums, setRecentAlbums] = useState([])
  const [popularSongs, setPopularSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const { playSong } = usePlayer()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [albumsResponse, songsResponse] = await Promise.all([
        fetch("http://localhost:5000/api/v1/album/all"),
        fetch("http://localhost:5000/api/v1/song/all"),
      ])

      if (albumsResponse.ok && songsResponse.ok) {
        const albums = await albumsResponse.json()
        const songs = await songsResponse.json()

        setRecentAlbums(albums.slice(0, 6))
        setPopularSongs(songs.slice(0, 8))
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
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
          <p className="text-white/80 font-medium">Loading your music...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto">
          Discover your next favorite song and dive into the world of premium music
        </p>
      </div>

      {/* Recent Albums */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Recent Albums</h2>
            <p className="text-white/60">Fresh releases and trending albums</p>
          </div>
          <Link
            to="/albums"
            className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
          >
            <span>View all</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {recentAlbums.map((album) => (
            <Link
              key={album.id}
              to={`/albums/${album.id}`}
              className="group bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-105"
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
      </section>

      {/* Popular Songs */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Popular Songs</h2>
            <p className="text-white/60">Most played tracks this week</p>
          </div>
          <Link
            to="/songs"
            className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
          >
            <span>View all</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          <div className="space-y-1 p-2">
            {popularSongs.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center p-4 rounded-xl hover:bg-white/10 group cursor-pointer transition-all duration-200"
                onClick={() => playSong(song)}
              >
                <div className="w-8 text-center text-white/60 group-hover:hidden font-medium">{index + 1}</div>
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

                <img
                  src={song.thumbnail || "/placeholder.svg?height=48&width=48"}
                  alt={song.title}
                  className="w-12 h-12 rounded-xl object-cover ml-4 shadow-md"
                />

                <div className="flex-1 ml-4 min-w-0">
                  <h4 className="font-semibold text-white truncate">{song.title}</h4>
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
                  <span className="text-sm text-white/60 font-medium">3:24</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
