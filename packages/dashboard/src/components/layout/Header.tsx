export function Header() {
    return (
        <header className="bg-slate-800/80 border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex items-center justify-between h-16 px-6">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">C</span>
                    </div>
                    <div>
                        <h1 className="font-semibold text-white">ControlBox</h1>
                        <p className="text-xs text-slate-400">Race Control Dashboard</p>
                    </div>
                </div>

                {/* Session indicator */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm text-slate-300">No Active Session</span>
                    </div>

                    {/* User menu placeholder */}
                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                        <span className="text-sm text-slate-300">S</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
