import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../../assets/assets'

const Sidebar = () => {
    const sidebarLinks = [
        { name: '📊 Thống kê', path: '/admin/dashboard', icon: assets.dashboardIcon },
        { name: 'Duyệt Khách Sạn', path: '/admin', icon: assets.dashboardIcon },
        { name: 'Quản Lý Khách Sạn', path: '/admin/hotels', icon: assets.homeIcon },
        { name: 'Quản Lý Người Dùng', path: '/admin/users', icon: assets.groupIcon },
    ]
    return (
        <div className='md:w-64 w-16 border-r h-full text-base border-gray-300 pt-4 flex flex-col transition-all duration-300'>
            {sidebarLinks.map((item, index) => (
                <NavLink
                    to={item.path}
                    key={index}
                    end
                    className={({ isActive }) =>
                        `flex items-center py-3 px-4 md:px-8 gap-3 ${isActive
                            ? "border-r-4 md:border-r-[6px] bg-blue-600/10 border-blue-600 text-blue-600"
                            : "hover:bg-gray-100/90 border-white text-gray-700"
                        }`
                    }
                >
                    <img src={item.icon} alt={item.icon} className='min-h-6 min-w-6' />
                    <p className='md:block hidden text-center'>{item.name}</p>
                </NavLink>
            ))}
        </div >
    )
}

export default Sidebar

