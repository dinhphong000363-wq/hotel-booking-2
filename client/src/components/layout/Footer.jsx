import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { assets } from '../../assets/assets'

const Footer = () => {
    const [email, setEmail] = useState('')
    const [theme, setTheme] = useState('dark') // 'dark', 'blue', 'purple', 'green'

    const handleSubscribe = (e) => {
        e.preventDefault()
        if (email) {
            toast.success('Cảm ơn bạn đã đăng ký nhận tin!')
            setEmail('')
        } else {
            toast.error('Vui lòng nhập email')
        }
    }

    const themes = {
        dark: {
            bg: 'from-gray-900 via-gray-800 to-black',
            primary: 'blue',
            primaryHover: 'blue-700',
            accent: 'from-blue-400 to-cyan-400',
            inputBorder: 'border-gray-700',
            inputFocus: 'focus:border-blue-500 focus:ring-blue-500/30'
        },
        blue: {
            bg: 'from-blue-900 via-blue-800 to-indigo-900',
            primary: 'indigo',
            primaryHover: 'indigo-700',
            accent: 'from-cyan-400 to-blue-400',
            inputBorder: 'border-blue-700',
            inputFocus: 'focus:border-cyan-500 focus:ring-cyan-500/30'
        },
        purple: {
            bg: 'from-purple-900 via-purple-800 to-pink-900',
            primary: 'purple',
            primaryHover: 'purple-700',
            accent: 'from-purple-400 to-pink-400',
            inputBorder: 'border-purple-700',
            inputFocus: 'focus:border-purple-500 focus:ring-purple-500/30'
        },
        green: {
            bg: 'from-emerald-900 via-teal-800 to-cyan-900',
            primary: 'emerald',
            primaryHover: 'emerald-700',
            accent: 'from-emerald-400 to-cyan-400',
            inputBorder: 'border-emerald-700',
            inputFocus: 'focus:border-emerald-500 focus:ring-emerald-500/30'
        }
    }

    const currentTheme = themes[theme]

    const themeButtons = [
        { key: 'dark', label: 'Tối', color: 'bg-gray-900', icon: '🌙' },
        { key: 'blue', label: 'Xanh', color: 'bg-blue-700', icon: '🌊' },
        { key: 'purple', label: 'Tím', color: 'bg-purple-700', icon: '💜' },
        { key: 'green', label: 'Lục', color: 'bg-emerald-700', icon: '🌿' }
    ]

    return (
        <footer className={`relative bg-gradient-to-br ${currentTheme.bg} text-white overflow-hidden transition-all duration-700`}>
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}></div>
            </div>

            {/* Theme Selector - Floating */}
            <div className="absolute top-4 right-4 z-10">
                <div className="bg-black/30 backdrop-blur-md rounded-full p-1 flex gap-1 border border-white/10">
                    {themeButtons.map(({ key, label, color, icon }) => (
                        <button
                            key={key}
                            onClick={() => setTheme(key)}
                            className={`group relative px-3 py-2 rounded-full transition-all duration-300 ${theme === key
                                ? `${color} shadow-lg scale-105`
                                : 'hover:bg-white/10'
                                }`}
                            title={label}
                        >
                            <span className="text-lg">{icon}</span>
                            {theme === key && (
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main content */}
            <div className="relative max-w-6xl mx-auto px-6 py-10">
                {/* Top section */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                    {/* Logo & tagline */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <img
                                src={assets.bookingIcon}
                                alt="Stayy Logo"
                                className="w-10 h-10 object-contain"
                            />
                            <h2 className={`text-3xl font-bold bg-gradient-to-r ${currentTheme.accent} bg-clip-text text-transparent transition-all duration-500`}>
                                Ở Đây
                            </h2>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Khám phá thế giới, tạo kỷ niệm đáng nhớ
                        </p>
                    </div>

                    {/* Newsletter */}
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full bg-white/5 backdrop-blur-sm border ${currentTheme.inputBorder} rounded-lg px-5 py-2.5 text-white placeholder-gray-500 outline-none ${currentTheme.inputFocus} transition-all`}
                                placeholder="Nhận ưu đãi qua email"
                            />
                            <button
                                onClick={handleSubscribe}
                                className={`absolute right-1.5 top-1.5 bg-${currentTheme.primary}-600 hover:bg-${currentTheme.primaryHover} text-white rounded-md px-5 py-1.5 text-sm font-medium transition-all transform hover:scale-105`}
                            >
                                Đăng ký
                            </button>
                        </div>
                    </div>
                </div>

                {/* Links grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-sm">
                    <div>
                        <h3 className="font-semibold mb-3 text-gray-300">Công ty</h3>
                        <ul className="space-y-2 text-gray-500">
                            <li><a href="#" className={`hover:text-${currentTheme.primary}-400 transition`}>Về chúng tôi</a></li>
                            <li><a href="#" className={`hover:text-${currentTheme.primary}-400 transition`}>Tuyển dụng</a></li>
                            <li><a href="#" className={`hover:text-${currentTheme.primary}-400 transition`}>Đối tác</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3 text-gray-300">Hỗ trợ</h3>
                        <ul className="space-y-2 text-gray-500">
                            <li><a href="#" className={`hover:text-${currentTheme.primary}-400 transition`}>Trợ giúp</a></li>
                            <li><a href="#" className={`hover:text-${currentTheme.primary}-400 transition`}>An toàn</a></li>
                            <li><a href="#" className={`hover:text-${currentTheme.primary}-400 transition`}>Liên hệ</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3 text-gray-300">Pháp lý</h3>
                        <ul className="space-y-2 text-gray-500">
                            <li><a href="#" className={`hover:text-${currentTheme.primary}-400 transition`}>Bảo mật</a></li>
                            <li><a href="#" className={`hover:text-${currentTheme.primary}-400 transition`}>Điều khoản</a></li>
                            <li><a href="#" className={`hover:text-${currentTheme.primary}-400 transition`}>Cookie</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3 text-gray-300">Kết nối</h3>
                        <div className="flex gap-3">
                            <a href="#" className={`w-9 h-9 bg-white/5 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/10 border border-gray-800 hover:border-${currentTheme.primary}-500 transition-all transform hover:scale-110`}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7.75 2h8.5C19.55 2 22 4.45 22 7.75v8.5c0 3.3-2.45 5.75-5.75 5.75h-8.5C4.45 22 2 19.55 2 16.25v-8.5C2 4.45 4.45 2 7.75 2zm0 1.5C5.35 3.5 3.5 5.35 3.5 7.75v8.5c0 2.4 1.85 4.25 4.25 4.25h8.5c2.4 0 4.25-1.85 4.25-4.25v-8.5c0-2.4-1.85-4.25-4.25-4.25h-8.5zM12 7.25a4.75 4.75 0 110 9.5 4.75 4.75 0 010-9.5zm0 1.5a3.25 3.25 0 100 6.5 3.25 3.25 0 000-6.5zM17.5 5.5a1 1 0 110 2 1 1 0 010-2z" />
                                </svg>
                            </a>
                            <a href="#" className={`w-9 h-9 bg-white/5 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/10 border border-gray-800 hover:border-${currentTheme.primary}-500 transition-all transform hover:scale-110`}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13.5 9H15V6.5h-1.5c-1.933 0-3.5 1.567-3.5 3.5v1.5H8v3h2.5V21h3v-7.5H16l.5-3h-3z" />
                                </svg>
                            </a>
                            <a href="#" className={`w-9 h-9 bg-white/5 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/10 border border-gray-800 hover:border-${currentTheme.primary}-500 transition-all transform hover:scale-110`}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22 5.92a8.2 8.2 0 01-2.36.65A4.1 4.1 0 0021.4 4a8.27 8.27 0 01-2.6 1A4.14 4.14 0 0016 4a4.15 4.15 0 00-4.15 4.15c0 .32.04.64.1.94a11.75 11.75 0 01-8.52-4.32a4.14 4.14 0 001.29 5.54A4.1 4.1 0 013 10v.05a4.15 4.15 0 003.33 4.07 4.12 4.12 0 01-1.87.07 4.16 4.16 0 003.88 2.89A8.33 8.33 0 012 19.56a11.72 11.72 0 006.29 1.84c7.55 0 11.68-6.25 11.68-11.67 0-.18 0-.35-.01-.53A8.18 8.18 0 0022 5.92z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} Stayy. All rights reserved.</p>
                    <p>Made with ❤️ in Vietnam</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer