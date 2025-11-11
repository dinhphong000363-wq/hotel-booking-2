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
import {Toaster} from 'react-hot-toast'
import { useAppContext } from './conext/AppContext'
import Loader from './components/Loader'

const App = () => {
  const isOwnerPath = useLocation().pathname.includes("owner")
  const {showHotelReg} = useAppContext()
  return (
    <div>
      <Toaster />
      {!isOwnerPath && <Navbar />}
      {showHotelReg && < HotelReg />}
      <div className="min-h-[70vh]">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/rooms' element={<AllRooms />} />
          <Route path='/rooms/:id' element={<RoomsTails />} />
          <Route path='/my-bookings' element={<MyBookings />} />
          <Route path='/loader/:nextUrl' element={<Loader />} />
          <Route path='/owner' element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path='add-room' element={<AddRoom />} />
            <Route path='list-room' element={<ListRoom />} />
          </Route>
        </Routes>
      </div>
    </div>
  )
}

export default App