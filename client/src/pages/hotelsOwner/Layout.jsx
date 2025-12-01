import React, { useEffect } from 'react'
import Navbar from '../../components/hotelsOwner/Navbar'
import Sidebar from '../../components/hotelsOwner/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../conext/AppContext'

const Layout = () => {
    const { isOwner, navigate, user } = useAppContext();

    useEffect(() => {
        // Only redirect if user is loaded and is not owner
        if (user && !isOwner) {
            navigate('/')
        }
    }, [isOwner, navigate, user])
    return (
        <div className='flex flex-col h-screen'>
            <Navbar />
            <div className="flex h-full">
                <Sidebar />
                <div className="flex-1 p-4 pt-10 md:px-10 h-full">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout