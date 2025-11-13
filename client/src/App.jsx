import React from 'react'
import Navbar from './components/Navbar'
import { useLocation, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AllRooms from './pages/AllRooms'
import RoomsTails from './pages/RoomsTails'
import MyBookings from './pages/MyBookings'
import HotelReg from './components/HotelReg'
import Layout from './pages/hotelsOwner/Layout'
import Dashboard from './pages/hotelsOwner/Dashboard'
import AddRoom from './pages/hotelsOwner/AddRoom'
import ListRoom from './pages/hotelsOwner/ListRoom'
import OwnerBookings from './pages/hotelsOwner/OwnerBookings'
import AdminLayout from './pages/admin/Layout'
import AdminDashboard from './pages/admin/AdminDashboard'
import HotelApproval from './pages/admin/HotelApproval'
import HotelManagement from './pages/admin/HotelManagement'
import UserManagement from './pages/admin/UserManagement'
import {Toaster} from 'react-hot-toast'
import { useAppContext } from './conext/AppContext'
import Loader from './components/Loader'
import Favorites from './pages/Favorites'

const App = () => {
  const location = useLocation()
  const isOwnerPath = location.pathname.includes("owner")
  const isAdminPath = location.pathname.includes("admin")
  const {showHotelReg} = useAppContext()
  return (
    <div>
      <Toaster />
      {!isOwnerPath && !isAdminPath && <Navbar />}
      {showHotelReg && < HotelReg />}
      <div className="min-h-[70vh]">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/rooms' element={<AllRooms />} />
          <Route path='/rooms/:id' element={<RoomsTails />} />
          <Route path='/my-bookings' element={<MyBookings />} />
          <Route path='/favorites' element={<Favorites />} />
          <Route path='/loader/:nextUrl' element={<Loader />} />
          <Route path='/owner' element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path='add-room' element={<AddRoom />} />
            <Route path='list-room' element={<ListRoom />} />
            <Route path='bookings' element={<OwnerBookings />} />
          </Route>
          <Route path='/admin' element={<AdminLayout />}>
            <Route path='dashboard' element={<AdminDashboard />} />
            <Route index element={<HotelApproval />} />
            <Route path='hotels' element={<HotelManagement />} />
            <Route path='users' element={<UserManagement />} />
          </Route>
        </Routes>
      </div>
    </div>
  )
}

export default App