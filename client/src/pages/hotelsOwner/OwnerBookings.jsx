import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAppContext } from '../../conext/AppContext'
import BookingDetailModal from '../../components/hotelsOwner/BookingDetailModal'
import { translateBookingStatus, translatePaymentStatus, translateRoomType } from '../../utils/translations'

const OwnerBookings = () => {
  const { getToken, currency } = useAppContext()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selected, setSelected] = useState(null)

  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
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

  const paymentStatus = (b) => translatePaymentStatus(b.isPaid)

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-semibold'>Quản lý Đặt phòng</h2>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className='border rounded px-3 py-2'
        >
          <option value=''>Tất cả trạng thái</option>
          <option value='pending'>Đang chờ xử lý</option>
          <option value='confirmed'>Đã xác nhận</option>
          <option value='cancelled'>Đã hủy</option>
          <option value='completed'>Hoàn thành</option>
        </select>
        <input
          type='date'
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className='border rounded px-3 py-2'
          placeholder='Từ ngày'
        />
        <input
          type='date'
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className='border rounded px-3 py-2'
          placeholder='Đến ngày'
        />
        <div className='flex gap-2'>
          <button onClick={fetchBookings} className='px-4 py-2 bg-blue-600 text-white rounded'>
            Lọc
          </button>
          <button
            onClick={() => { setStatusFilter(''); setFromDate(''); setToDate('') }}
            className='px-4 py-2 border rounded'
          >
            Xóa lọc
          </button>
        </div>
      </div>

      <div className='overflow-auto border rounded'>
        <table className='min-w-full text-sm'>
          <thead className='bg-gray-50 text-gray-600'>
            <tr>
              <th className='text-left p-3'>Ảnh phòng</th>
              <th className='text-left p-3'>Khách hàng</th>
              <th className='text-left p-3'>Email</th>
              <th className='text-left p-3'>Phòng</th>
              <th className='text-left p-3'>Nhận</th>
              <th className='text-left p-3'>Trả</th>
              <th className='text-left p-3'>Tổng</th>
              <th className='text-left p-3'>Thanh toán</th>
              <th className='text-left p-3'>Trạng thái</th>
              <th className='text-left p-3'>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className='p-3' colSpan={10}>Đang tải...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td className='p-3' colSpan={10}>Không có đặt phòng</td></tr>
            ) : (
              bookings.map(b => {
                const roomImage = b?.room?.images && b.room.images.length > 0 ? b.room.images[0] : null;
                return (
                  <tr key={b._id} className='border-t hover:bg-gray-50'>
                    <td className='p-3'>
                      <div className='w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center relative'>
                        {roomImage ? (
                          <img
                            src={roomImage}
                            alt={translateRoomType(b?.room?.roomType) || 'Room'}
                            className='w-full h-full object-cover'
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                              if (placeholder) placeholder.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className='image-placeholder absolute inset-0 w-full h-full flex items-center justify-center text-gray-400 text-xs text-center px-2' style={{ display: roomImage ? 'none' : 'flex' }}>
                          <span>Không có ảnh</span>
                        </div>
                      </div>
                    </td>
                    <td className='p-3'>{b?.user?.username}</td>
                    <td className='p-3'>{b?.user?.email}</td>
                    <td className='p-3'>{translateRoomType(b?.room?.roomType)}</td>
                    <td className='p-3'>{new Date(b.checkInDate).toLocaleDateString('vi-VN')}</td>
                    <td className='p-3'>{new Date(b.checkOutDate).toLocaleDateString('vi-VN')}</td>
                    <td className='p-3'>{currency} {Number(b.totalPrice || 0).toLocaleString('vi-VN')}</td>
                    <td className='p-3 capitalize'>{paymentStatus(b)}</td>
                    <td className='p-3 capitalize'>{translateBookingStatus(b.status)}</td>
                    <td className='p-3'>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => setSelected(b)}
                          className='px-3 py-1 border rounded'
                        >
                          Chi tiết
                        </button>
                        <button
                          disabled={b.status !== 'pending'}
                          onClick={() => updateStatus(b._id, 'confirmed')}
                          className={`px-3 py-1 rounded text-white ${b.status !== 'pending' ? 'bg-gray-300' : 'bg-green-600'}`}
                        >
                          Xác nhận
                        </button>
                        <button
                          disabled={b.status !== 'pending'}
                          onClick={() => updateStatus(b._id, 'cancelled')}
                          className={`px-3 py-1 rounded text-white ${b.status !== 'pending' ? 'bg-gray-300' : 'bg-red-600'}`}
                        >
                          Hủy
                        </button>
                        <button
                          disabled={b.status === 'completed'}
                          onClick={() => updateStatus(b._id, 'completed')}
                          className={`px-3 py-1 rounded ${b.status === 'completed' ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white'}`}
                        >
                          Hoàn thành
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <BookingDetailModal booking={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

export default OwnerBookings


