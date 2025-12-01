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
import HotelInfo from './pages/hotelsOwner/HotelInfo'
import AdminLayout from './pages/admin/Layout'
import AdminDashboard from './pages/admin/AdminDashboard'
import HotelApproval from './pages/admin/HotelApproval'
import HotelManagement from './pages/admin/HotelManagement'
import UserManagement from './pages/admin/UserManagement'
import { Toaster } from 'react-hot-toast'
import { useAppContext } from './conext/AppContext'
import Loader from './components/Loader'
import Favorites from './pages/Favorites'
import DiscountedRooms from './pages/DiscountedRooms'
import Chatbot from './components/Chatbot'
import HotelStatus from './pages/HotelStatus'
import Profile from './pages/Profile'
import AuthCallback from './pages/AuthCallback'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  const location = useLocation()
  const isOwnerPath = location.pathname.includes("owner")
  const isAdminPath = location.pathname.includes("admin")
  const { showHotelReg } = useAppContext()
  return (
    <div>
      <Toaster />
      {!isOwnerPath && !isAdminPath && <Navbar />}
      {showHotelReg && < HotelReg />}
      {!isOwnerPath && !isAdminPath && <Chatbot />}
      <div className="min-h-[70vh]">
        <Routes>
          {/* Auth routes - public */}
          <Route path='/auth/callback' element={<AuthCallback />} />

          {/* Public routes */}
          <Route path='/' element={<Home />} />
          <Route path='/rooms' element={<AllRooms />} />
          <Route path='/rooms/:id' element={<RoomsTails />} />
          <Route path='/discounted-rooms' element={<DiscountedRooms />} />

          {/* Protected routes */}
          <Route path='/profile' element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path='/my-bookings' element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          } />
          <Route path='/favorites' element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          } />
          <Route path='/hotel-status' element={
            <ProtectedRoute>
              <HotelStatus />
            </ProtectedRoute>
          } />
          <Route path='/loader/:nextUrl' element={<Loader />} />

          {/* Owner routes - protected */}
          <Route path='/owner' element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path='hotel-info' element={<HotelInfo />} />
            <Route path='add-room' element={<AddRoom />} />
            <Route path='list-room' element={<ListRoom />} />
            <Route path='bookings' element={<OwnerBookings />} />
          </Route>

          {/* Admin routes - protected */}
          <Route path='/admin' element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path='dashboard' element={<AdminDashboard />} />
            <Route path='approval' element={<HotelApproval />} />
            <Route path='hotels' element={<HotelManagement />} />
            <Route path='users' element={<UserManagement />} />
          </Route>
        </Routes>
      </div>
    </div>
  )
}

export default App