import React from 'react'
import { translateBookingStatus, translatePaymentMethod, translatePaymentStatus, translateRoomType } from '../../utils/translations'

const BookingDetailModal = ({ booking, onClose }) => {
  if (!booking) return null
  const {
    _id, user, room, hotel, checkInDate, checkOutDate, totalPrice, guests, status, isPaid, paymentMethod,
  } = booking

  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
      <div className='bg-white rounded shadow-lg w-full max-w-lg'>
        <div className='flex justify-between items-center p-4 border-b'>
          <h3 className='font-semibold'>Chi tiết đặt phòng</h3>
          <button onClick={onClose} className='text-gray-600 hover:text-black'>✕</button>
        </div>
        <div className='p-4 space-y-2 text-sm'>
          <div><span className='text-gray-500'>Mã:</span> {_id}</div>
          <div><span className='text-gray-500'>Khách hàng:</span> {user?.username} ({user?.email})</div>
          <div><span className='text-gray-500'>Khách sạn:</span> {hotel?.name}</div>
          <div><span className='text-gray-500'>Phòng:</span> {translateRoomType(room?.roomType)}</div>
          <div><span className='text-gray-500'>Số khách:</span> {guests}</div>
          <div><span className='text-gray-500'>Nhận phòng:</span> {new Date(checkInDate).toLocaleString('vi-VN')}</div>
          <div><span className='text-gray-500'>Trả phòng:</span> {new Date(checkOutDate).toLocaleString('vi-VN')}</div>
          <div><span className='text-gray-500'>Tổng tiền:</span> {totalPrice}</div>
          <div><span className='text-gray-500'>Thanh toán:</span> {translatePaymentStatus(isPaid)}{paymentMethod ? ` (${translatePaymentMethod(paymentMethod)})` : ''}</div>
          <div><span className='text-gray-500'>Trạng thái:</span> {translateBookingStatus(status)}</div>
        </div>
        <div className='p-4 border-t flex justify-end'>
          <button onClick={onClose} className='px-4 py-2 border rounded'>Đóng</button>
        </div>
      </div>
    </div>
  )
}

export default BookingDetailModal


