import React from 'react'
import Navbar from './components/layout/Navbar'
import { useLocation, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AllRooms from './pages/AllRooms'
import RoomsTails from './pages/RoomsTails'
import MyBookings from './pages/MyBookings'
import RegisterHotel from './pages/RegisterHotel'
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
import { useAppContext } from './context/AppContext'
import Favorites from './pages/Favorites'
import DiscountedRooms from './pages/DiscountedRooms'
import Chatbot from './components/layout/Chatbot'
import HotelStatus from './pages/HotelStatus'
import Profile from './pages/Profile'
import AuthCallback from './pages/AuthCallback'
import ProtectedRoute from './components/common/ProtectedRoute'
import StripePayment from './pages/payment/StripePayment'
import MoMoPayment from './pages/payment/MoMoPayment'
import Experience from './pages/Experience'
import About from './pages/About'

const App = () => {
  const location = useLocation()
  const isOwnerPath = location.pathname.includes("owner")
  const isAdminPath = location.pathname.includes("admin")
  const isPaymentPath = location.pathname.includes("/payment/")
  return (
    <div>
      <Toaster />
      {!isOwnerPath && !isAdminPath && !isPaymentPath && <Navbar />}
      {!isOwnerPath && !isAdminPath && !isPaymentPath && <Chatbot />}
      <div className="min-h-[70vh]">
        <Routes>
          {/* Auth routes - public */}
          <Route path='/auth/callback' element={<AuthCallback />} />

          {/* Public routes */}
          <Route path='/' element={<Home />} />
          <Route path='/rooms' element={<AllRooms />} />
          <Route path='/rooms/:id' element={<RoomsTails />} />
          <Route path='/discounted-rooms' element={<DiscountedRooms />} />
          <Route path='/experience' element={<Experience />} />
          <Route path='/about' element={<About />} />
          <Route path='/register-hotel' element={
            <ProtectedRoute>
              <RegisterHotel />
            </ProtectedRoute>
          } />

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

          {/* Payment routes - protected */}
          <Route path='/payment/stripe' element={
            <ProtectedRoute>
              <StripePayment />
            </ProtectedRoute>
          } />
          <Route path='/payment/momo' element={
            <ProtectedRoute>
              <MoMoPayment />
            </ProtectedRoute>
          } />

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