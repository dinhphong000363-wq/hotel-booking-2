import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { translateAmenity, translateRoomType } from '../utils/translations'
import { isAuthenticated, getAuthHeaders } from '../utils/authUtils'

const Favorites = () => {
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true)
        setError('')
        if (!isAuthenticated()) {
          setFavorites([])
          setLoading(false)
          return
        }
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/favorites/me`, {
          headers: getAuthHeaders()
        })
        setFavorites(data?.favorites || [])
      } catch (e) {
        setError('Không thể tải danh sách yêu thích.')
      } finally {
        setLoading(false)
      }
    }
    fetchFavorites()
  }, [])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-4">Danh sách phòng yêu thích</h1>
        <div>Đang tải...</div>
      </div>
    )
  }

  if (!isAuthenticated()) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-4">Danh sách phòng yêu thích</h1>
        <div>Vui lòng đăng nhập để xem danh sách yêu thích.</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Danh sách phòng yêu thích</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {favorites.length === 0 ? (
        <div>Chưa có phòng nào trong danh sách yêu thích.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((item) => {
            const room = item.room || {}
            const image = room.images?.[0]
            return (
              <Link
                key={item._id || `${room._id}-${item._id}`}
                to={room._id ? `/rooms/${room._id}` : '#'}
                className="border rounded-xl overflow-hidden hover:shadow-md transition bg-white"
              >
                {image ? (
                  <img src={image} alt="" className="h-40 w-full object-cover" />
                ) : (
                  <div className="h-40 w-full bg-gray-100 flex items-center justify-center text-gray-500">
                    Không có ảnh
                  </div>
                )}
                <div className="p-4">
                  <div className="font-medium mb-1">{translateRoomType(room.roomType) || 'Phòng'}</div>
                  <div className="text-sm text-gray-600">
                    {Array.isArray(room.amenities) ? room.amenities.slice(0, 3).map(translateAmenity).join(' • ') : ''}
                  </div>
                  <div className="mt-2 font-semibold">
                    {typeof room.pricePerNight === 'number' ? `${room.pricePerNight.toLocaleString()} đ/đêm` : ''}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Favorites


