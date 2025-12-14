import React from 'react'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import UserMenu from '../common/UserMenu'

const Navbar = () => {
    const { user } = useAppContext();

    return (
        <div className='flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white transition-all duration-300'>
            <Link to='/'>
                <img src={assets.bookingIcon} alt="logo" className='h-9 invert opacity-80' />
            </Link>
            {user && <UserMenu user={user} />}
        </div>
    )
}

export default Navbar