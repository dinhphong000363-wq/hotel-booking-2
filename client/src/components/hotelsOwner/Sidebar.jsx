import React from 'react'
import { Link, NavLink } from 'react-router-dom'

const Sidebar = () => {
    const sidebarLinks = [
        { 
            name: 'Bảng điều khiển', 
            path: '/owner',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            gradient: 'from-blue-500 to-cyan-500'
        },
        { 
            name: 'Thông tin khách sạn', 
            path: '/owner/hotel-info',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            gradient: 'from-indigo-500 to-purple-500'
        },
        { 
            name: 'Thêm phòng', 
            path: '/owner/add-room',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            ),
            gradient: 'from-green-500 to-emerald-500'
        },
        { 
            name: 'Danh sách phòng', 
            path: '/owner/list-room',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            ),
            gradient: 'from-purple-500 to-pink-500'
        },
        { 
            name: 'Đơn đặt phòng', 
            path: '/owner/bookings',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
            gradient: 'from-orange-500 to-red-500'
        },
    ]

    return (
        <div className='md:w-72 w-20 border-r border-gray-200/80 h-screen fixed top-0 left-0 bg-gradient-to-b from-white via-blue-50/30 to-indigo-50/30 shadow-2xl flex flex-col transition-all duration-300 relative overflow-y-auto overflow-x-hidden custom-scrollbar z-40'>
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
            
            {/* Hotel Owner Header */}
            <div className="relative z-10 px-4 md:px-6 py-6 mb-2">
                <div className="flex items-center justify-center md:justify-start gap-3">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center transform hover:rotate-12 hover:scale-110 transition-all duration-300">
                        <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                    </div>
                    <div className="hidden md:block">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Hotel Manager
                        </h2>
                        <p className="text-xs text-gray-600 font-semibold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Quản lý khách sạn
                        </p>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="relative z-10 mx-4 md:mx-6 mb-4">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            {/* Navigation Links */}
            <nav className="relative z-10 flex-1 px-3 md:px-4 space-y-1.5">
                {sidebarLinks.map((item, index) => (
                    <NavLink
                        to={item.path}
                        key={index}
                        end
                        className={({ isActive }) =>
                            `group relative flex items-center py-4 px-3 md:px-5 gap-4 rounded-2xl transition-all duration-300 overflow-hidden ${
                                isActive
                                    ? "bg-gradient-to-r " + item.gradient + " text-white shadow-xl transform scale-[1.02]"
                                    : "hover:bg-white/80 hover:shadow-lg text-gray-600 hover:text-gray-900 backdrop-blur-sm"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {/* Animated background for non-active items */}
                                {!isActive && (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                    </>
                                )}
                                
                                {/* Icon container with special effects */}
                                <div className={`relative z-10 flex-shrink-0 transform transition-all duration-300 ${
                                    isActive 
                                        ? 'scale-110' 
                                        : 'group-hover:scale-110 group-hover:rotate-6'
                                }`}>
                                    <div className={`${isActive ? '' : 'group-hover:drop-shadow-lg'}`}>
                                        {item.icon}
                                    </div>
                                </div>
                                
                                {/* Text with gradient on hover */}
                                <span className={`hidden md:block relative z-10 font-bold text-sm whitespace-nowrap transition-all duration-300 ${
                                    isActive 
                                        ? 'text-white tracking-wide' 
                                        : 'text-gray-700 group-hover:text-gray-900'
                                }`}>
                                    {item.name}
                                </span>

                                {/* Active indicator - mobile */}
                                {isActive && (
                                    <div className="md:hidden absolute -right-1 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                                        <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse delay-75"></div>
                                        <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse delay-150"></div>
                                    </div>
                                )}

                                {/* Glow effect for active state */}
                                {isActive && (
                                    <>
                                        <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse"></div>
                                        <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-transparent rounded-2xl blur-sm"></div>
                                    </>
                                )}

                                {/* Hover arrow indicator */}
                                {!isActive && (
                                    <div className="hidden md:block absolute right-3 opacity-0 group-hover:opacity-100 group-hover:right-4 transition-all duration-300">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom stats/info card */}
            <div className="relative z-10 mt-auto px-3 md:px-4 py-6">
                <div className="hidden md:block p-4 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                            <span className="text-xs font-bold text-gray-700">Đang hoạt động</span>
                        </div>
                        <div className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold rounded-full shadow-md">
                            PRO
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="font-semibold">Phiên bản 3.0.2</span>
                    </div>
                </div>
                
                {/* Mobile bottom indicator */}
                <div className="md:hidden flex justify-center">
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse delay-150"></div>
                    </div>
                </div>
            </div>

            {/* Animated side border */}
            <div className="absolute inset-y-0 right-0 w-[2px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/50 via-indigo-500/50 to-purple-500/50 animate-pulse"></div>
            </div>

            {/* Custom scrollbar styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
                    border-radius: 999px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #2563eb, #7c3aed);
                }
                .delay-75 {
                    animation-delay: 75ms;
                }
                .delay-150 {
                    animation-delay: 150ms;
                }
            `}</style>
        </div>
    )
}

export default Sidebar