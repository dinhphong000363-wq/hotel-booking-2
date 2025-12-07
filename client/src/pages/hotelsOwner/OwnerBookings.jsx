import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAppContext } from '../../conext/AppContext'
import BookingDetailModal from '../../components/hotelsOwner/BookingDetailModal'
import CancelBookingByOwnerModal from '../../components/hotelsOwner/CancelBookingByOwnerModal'
import { translateBookingStatus, translatePaymentStatus, translateRoomType } from '../../utils/translations'

const OwnerBookings = () => {
  const { getToken, currency } = useAppContext()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selected, setSelected] = useState(null)
  const [cancelModal, setCancelModal] = useState({ isOpen: false, booking: null })
  const [cancelling, setCancelling] = useState(false)

  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (statusFilter) {
      params.set('status', statusFilter)
    }
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)
    return params.toString()
  }, [statusFilter, fromDate, toDate])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      const url = `/api/bookings/owner${query ? `?${query}` : ''}`
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        setBookings(data.bookings || [])
      } else {
        toast.error(data.message || 'Không thể tải danh sách đặt phòng')
      }
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi tải danh sách đặt phòng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const updateStatus = async (id, status) => {
    try {
      const token = await getToken()
      const { data } = await axios.patch(`/api/bookings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        toast.success('Cập nhật trạng thái thành công')
        setBookings(prev => prev.map(b => (b._id === id ? data.booking : b)))
      } else {
        toast.error(data.message || 'Cập nhật thất bại')
      }
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái')
    }
  }

  const handleCancelClick = (booking) => {
    if (booking.status === 'cancelled') {
      toast.error('Đặt phòng đã được hủy trước đó')
      return
    }

    if (booking.status === 'completed') {
      toast.error('Không thể hủy đặt phòng đã hoàn thành')
      return
    }

    setCancelModal({ isOpen: true, booking })
  }

  const handleCloseCancelModal = () => {
    setCancelModal({ isOpen: false, booking: null })
  }

  const handleConfirmCancel = async (reason) => {
    if (!cancelModal.booking) return

    setCancelling(true)
    try {
      const token = await getToken()
      const { data } = await axios.post(
        `/api/bookings/${cancelModal.booking._id}/cancel-by-owner`,
        { cancellationReason: reason },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (data.success) {
        toast.success('Đã hủy đặt phòng thành công! Khách hàng sẽ được hoàn 100%')
        handleCloseCancelModal()
        fetchBookings()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Không thể hủy đặt phòng')
    } finally {
      setCancelling(false)
    }
  }

  const paymentStatus = (b) => translatePaymentStatus(b.isPaid)

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header với gradient */}
        <div className='bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white'>
          <h2 className='text-3xl font-bold flex items-center gap-3'>
            <svg className='w-10 h-10' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
            </svg>
            Quản lý Đặt phòng
          </h2>
          <p className='mt-2 text-blue-100'>Theo dõi và quản lý tất cả các đặt phòng của bạn</p>
        </div>

        {/* Filters với card đẹp */}
        <div className='bg-white rounded-2xl shadow-xl p-6 border border-gray-100'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='relative group'>
              <label className='text-xs font-semibold text-gray-600 mb-1 block'>Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className='w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none appearance-none cursor-pointer hover:border-indigo-400'
              >
                <option value=''>Tất cả trạng thái</option>
                <option value='pending'>Đang chờ xử lý</option>
                <option value='confirmed'>Đã xác nhận</option>
                <option value='cancelled'>Đã hủy</option>
                <option value='completed'>Hoàn thành</option>
              </select>
              <svg className='absolute right-3 top-9 w-5 h-5 text-gray-400 pointer-events-none' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
              </svg>
            </div>
            
            <div className='relative group'>
              <label className='text-xs font-semibold text-gray-600 mb-1 block'>Từ ngày</label>
              <input
                type='date'
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className='w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none hover:border-indigo-400'
                placeholder='Từ ngày'
              />
            </div>
            
            <div className='relative group'>
              <label className='text-xs font-semibold text-gray-600 mb-1 block'>Đến ngày</label>
              <input
                type='date'
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className='w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none hover:border-indigo-400'
                placeholder='Đến ngày'
              />
            </div>
            
            <div className='flex gap-2 items-end'>
              <button 
                onClick={fetchBookings} 
                className='flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700'
              >
                <span className='flex items-center justify-center gap-2'>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z' />
                  </svg>
                  Lọc
                </span>
              </button>
              <button
                onClick={() => { setStatusFilter(''); setFromDate(''); setToDate('') }}
                className='px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-red-400 hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all duration-300 shadow-sm hover:shadow-md'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Table với styling đẹp */}
        <div className='bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100'>
          <div className='overflow-auto'>
            <table className='min-w-full text-sm'>
              <thead className='bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-b-2 border-gray-200'>
                <tr>
                  <th className='text-left p-4 font-bold'>Ảnh phòng</th>
                  <th className='text-left p-4 font-bold'>Khách hàng</th>
                  <th className='text-left p-4 font-bold'>Email</th>
                  <th className='text-left p-4 font-bold'>Phòng</th>
                  <th className='text-left p-4 font-bold'>Nhận</th>
                  <th className='text-left p-4 font-bold'>Trả</th>
                  <th className='text-left p-4 font-bold'>Tổng</th>
                  <th className='text-left p-4 font-bold'>Thanh toán</th>
                  <th className='text-left p-4 font-bold'>Trạng thái</th>
                  <th className='text-left p-4 font-bold'>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className='p-8 text-center' colSpan={10}>
                      <div className='flex items-center justify-center gap-3'>
                        <div className='w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin'></div>
                        <span className='text-gray-600 font-medium'>Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td className='p-12 text-center' colSpan={10}>
                      <div className='flex flex-col items-center gap-4'>
                        <div className='w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center'>
                          <svg className='w-12 h-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                          </svg>
                        </div>
                        <p className='text-gray-500 font-medium text-lg'>Không có đặt phòng nào</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bookings.map(b => {
                    const isCompleted = b.status === 'completed';
                    const roomImage = b?.room?.images && b.room.images.length > 0 ? b.room.images[0] : null;
                    return (
                      <tr key={b._id} className='border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300'>
                        <td className='p-4'>
                          {isCompleted ? (
                            <div className='w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-inner'>
                              <span className='text-gray-500 text-xs font-semibold'>Đã ẩn</span>
                            </div>
                          ) : (
                            <div className='w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center relative shadow-md hover:shadow-xl transition-shadow duration-300 ring-2 ring-gray-200 hover:ring-indigo-300'>
                              {roomImage ? (
                                <img
                                  src={roomImage}
                                  alt={translateRoomType(b?.room?.roomType) || 'Room'}
                                  className='w-full h-full object-cover hover:scale-110 transition-transform duration-300'
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                                    if (placeholder) placeholder.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className='image-placeholder absolute inset-0 w-full h-full flex items-center justify-center text-gray-400 text-xs text-center px-2 bg-gradient-to-br from-gray-100 to-gray-200' style={{ display: roomImage ? 'none' : 'flex' }}>
                                <span className='font-medium'>Không có ảnh</span>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className='p-4'>
                          <span className='font-medium text-gray-800'>{isCompleted ? '***' : b?.user?.username}</span>
                        </td>
                        <td className='p-4'>
                          <span className='text-gray-600'>{isCompleted ? '***' : b?.user?.email}</span>
                        </td>
                        <td className='p-4'>
                          <span className='inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold text-xs'>
                            {translateRoomType(b?.room?.roomType)}
                          </span>
                        </td>
                        <td className='p-4'>
                          <span className='text-gray-700 font-medium'>{new Date(b.checkInDate).toLocaleDateString('vi-VN')}</span>
                        </td>
                        <td className='p-4'>
                          <span className='text-gray-700 font-medium'>{new Date(b.checkOutDate).toLocaleDateString('vi-VN')}</span>
                        </td>
                        <td className='p-4'>
                          <span className='font-bold text-indigo-600 text-base'>{currency}{Number(b.totalPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </td>
                        <td className='p-4 capitalize'>
                          <span className='inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 font-semibold text-xs'>
                            {paymentStatus(b)}
                          </span>
                        </td>
                        <td className='p-4 capitalize'>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full font-semibold text-xs ${
                            b.status === 'pending' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700' :
                            b.status === 'confirmed' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700' :
                            b.status === 'cancelled' ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700' :
                            'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                          }`}>
                            {translateBookingStatus(b.status)}
                          </span>
                        </td>
                        <td className='p-4'>
                          <div className='flex gap-2 flex-wrap'>
                            <button
                              onClick={() => setSelected(b)}
                              className='px-4 py-2 border-2 border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white hover:shadow-lg active:scale-95 transition-all duration-300 font-semibold text-xs'
                            >
                              Chi tiết
                            </button>
                            {b.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateStatus(b._id, 'confirmed')}
                                  className='px-4 py-2 rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 font-semibold text-xs'
                                >
                                  Xác nhận
                                </button>
                                <button
                                  onClick={() => handleCancelClick(b)}
                                  className='px-4 py-2 rounded-lg text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 font-semibold text-xs'
                                >
                                  Hủy
                                </button>
                              </>
                            )}
                            {b.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => handleCancelClick(b)}
                                  className='px-4 py-2 rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 font-semibold text-xs'
                                >
                                  Hủy
                                </button>
                                <button
                                  onClick={() => updateStatus(b._id, 'completed')}
                                  className='px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 font-semibold text-xs'
                                >
                                  Hoàn thành
                                </button>
                              </>
                            )}
                            {b.status === 'cancelled' && (
                              <span className='px-4 py-2 text-red-600 text-xs font-bold bg-red-50 rounded-lg'>Đã hủy</span>
                            )}
                            {b.status === 'completed' && (
                              <span className='px-4 py-2 text-green-600 text-xs font-bold bg-green-50 rounded-lg'>Đã hoàn thành</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected && (
        <BookingDetailModal booking={selected} onClose={() => setSelected(null)} />
      )}

      <CancelBookingByOwnerModal
        isOpen={cancelModal.isOpen}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
        booking={cancelModal.booking}
        loading={cancelling}
      />
    </div>
  )
}

export default OwnerBookings