import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
    const sidebarLinks = [
        { 
            name: 'Thống kê', 
            path: '/admin/dashboard', 
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            gradient: 'from-blue-500 to-cyan-500'
        },
        { 
            name: 'Duyệt Khách Sạn', 
            path: '/admin/approval', 
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            gradient: 'from-green-500 to-emerald-500'
        },
        { 
            name: 'Quản Lý Khách Sạn', 
            path: '/admin/hotels', 
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            gradient: 'from-purple-500 to-pink-500'
        },
        { 
            name: 'Quản Lý Người Dùng', 
            path: '/admin/users', 
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            gradient: 'from-orange-500 to-red-500'
        },
    ]

    return (
        <div className='md:w-72 w-20 border-r border-gray-200/80 h-full bg-gradient-to-b from-slate-50 via-white to-slate-50 shadow-xl flex flex-col transition-all duration-300 relative overflow-hidden'>
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-full h-32 bg-gradient-to-tl from-pink-500/5 to-orange-500/5 blur-3xl"></div>
            
            {/* Logo/Header Section */}
            <div className="relative z-10 px-4 md:px-6 py-8 mb-4">
                <div className="flex items-center justify-center md:justify-start gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center transform hover:rotate-6 transition-transform duration-300">
                        <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div className="hidden md:block">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Admin Panel</h2>
                        <p className="text-xs text-gray-500 font-medium">Quản trị hệ thống</p>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="relative z-10 flex-1 px-3 md:px-4 space-y-2">
                {sidebarLinks.map((item, index) => (
                    <NavLink
                        to={item.path}
                        key={index}
                        end
                        className={({ isActive }) =>
                            `group relative flex items-center py-4 px-3 md:px-5 gap-4 rounded-2xl transition-all duration-300 overflow-hidden ${
                                isActive
                                    ? "bg-gradient-to-r " + item.gradient + " text-white shadow-lg shadow-blue-500/30 scale-105"
                                    : "hover:bg-white hover:shadow-md text-gray-600 hover:text-gray-800"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {/* Background shine effect */}
                                {!isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                )}
                                
                                {/* Icon container */}
                                <div className={`relative z-10 flex-shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform duration-300'}`}>
                                    {item.icon}
                                </div>
                                
                                {/* Text */}
                                <span className={`hidden md:block relative z-10 font-semibold text-sm whitespace-nowrap ${
                                    isActive ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'
                                }`}>
                                    {item.name}
                                </span>

                                {/* Active indicator dot (mobile) */}
                                {isActive && (
                                    <div className="md:hidden absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                )}

                                {/* Animated border for active state */}
                                {isActive && (
                                    <div className="absolute inset-0 rounded-2xl">
                                        <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse"></div>
                                    </div>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer decoration */}
            <div className="relative z-10 mt-auto px-3 md:px-4 py-6">
                <div className="hidden md:block p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold text-gray-700">Hệ thống hoạt động</span>
                    </div>
                    <p className="text-xs text-gray-600">Phiên bản 2.0.1</p>
                </div>
                
                {/* Mobile indicator */}
                <div className="md:hidden flex justify-center">
                    <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                </div>
            </div>

            {/* Animated border gradient */}
            <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-blue-200 to-transparent"></div>
        </div>
    )
}

export default Sidebar