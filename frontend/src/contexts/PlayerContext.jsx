"use client"

import { createContext, useContext, useState, useRef, useEffect } from "react"

const PlayerContext = createContext()

export function usePlayer() {
  return useContext(PlayerContext)
}

export function PlayerProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)

  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0
        audio.play()
      } else {
        setIsPlaying(false)
      }
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [isRepeat])

  const playSong = (song) => {
    setCurrentSong(song)
    const audio = audioRef.current
    if (audio) {
      audio.src = song.audio
      audio.load()
      audio.play()
      setIsPlaying(true)
    }
  }

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio || !currentSong) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (newTime) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (newVolume) => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  const value = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isRepeat,
    isShuffle,
    audioRef,
    playSong,
    togglePlay,
    handleSeek,
    handleVolumeChange,
    toggleMute,
    setIsRepeat,
    setIsShuffle,
  }

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} />
    </PlayerContext.Provider>
  )
}
