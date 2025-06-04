import Sidebar from "./Sidebar"
import Header from "./Header"
import Player from "./Player"

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">{children}</div>
        </main>
      </div>
      <Player />
    </div>
  )
}

export default Layout
