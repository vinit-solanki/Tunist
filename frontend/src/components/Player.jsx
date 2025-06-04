"use client"

import { usePlayer } from "../contexts/PlayerContext"

function Player() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isRepeat,
    isShuffle,
    togglePlay,
    handleSeek,
    handleVolumeChange,
    toggleMute,
    setIsRepeat,
    setIsShuffle,
  } = usePlayer()

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (!currentSong) return null

  return (
    <footer className="bg-black/40 backdrop-blur-xl border-t border-white/10 sticky bottom-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Song Info */}
          <div className="flex items-center space-x-4 w-1/3">
            <div className="relative group">
              <img
                src={currentSong.thumbnail || "/placeholder.svg?height=56&width=56"}
                alt={currentSong.title}
                className="w-14 h-14 rounded-xl object-cover shadow-lg"
              />
              <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-white truncate">{currentSong.title}</h4>
              <p className="text-sm text-white/60 truncate">{currentSong.description}</p>
            </div>
            <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center space-y-3 w-1/3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isShuffle ? "text-purple-400 bg-purple-500/20" : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12l2 2 4-4"
                  />
                </svg>
              </button>

              <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
                  />
                </svg>
              </button>

              <button
                onClick={togglePlay}
                className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                {isPlaying ? (
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-white ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15"
                    />
                  </svg>
                )}
              </button>

              <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"
                  />
                </svg>
              </button>

              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isRepeat ? "text-purple-400 bg-purple-500/20" : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>

            <div className="flex items-center space-x-3 w-full max-w-md">
              <span className="text-xs text-white/60 font-medium w-10 text-right">{formatTime(currentTime)}</span>
              <div className="flex-1 relative group">
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-200"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                  style={{ left: `${(currentTime / duration) * 100}%`, marginLeft: "-6px" }}
                  onClick={(e) => {
                    const rect = e.currentTarget.parentElement.getBoundingClientRect()
                    const percent = (e.clientX - rect.left) / rect.width
                    handleSeek(percent * duration)
                  }}
                />
              </div>
              <span className="text-xs text-white/60 font-medium w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume Controls */}
          <div className="flex items-center space-x-3 w-1/3 justify-end">
            <button
              onClick={toggleMute}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              {isMuted ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                </svg>
              )}
            </button>
            <div className="w-24 relative group">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-200"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                />
              </div>
              <div
                className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                style={{ left: `${(isMuted ? 0 : volume) * 100}%`, marginLeft: "-6px" }}
                onClick={(e) => {
                  const rect = e.currentTarget.parentElement.getBoundingClientRect()
                  const percent = (e.clientX - rect.left) / rect.width
                  handleVolumeChange(percent)
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Player
