import React, { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { useAppContext } from '../../conext/AppContext'
import toast from 'react-hot-toast'
import { assets } from '../../assets/assets'

const HotelInfo = () => {
    const { axios, getToken, user } = useAppContext()
    const [hotel, setHotel] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        contact: '',
        city: '',
    })

    const fetchHotelInfo = async () => {
        try {
            setLoading(true)
            const token = await getToken()
            const { data } = await axios.get('/api/hotels/owner', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                setHotel(data.hotel)
                setFormData({
                    name: data.hotel.name || '',
                    address: data.hotel.address || '',
                    contact: data.hotel.contact || '',
                    city: data.hotel.city || '',
                })
            } else {
                toast.error(data.message || 'Không thể tải thông tin khách sạn')
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchHotelInfo()
        }
    }, [user])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSave = async () => {
        if (!formData.name || !formData.address || !formData.contact || !formData.city) {
            toast.error('Vui lòng điền đầy đủ thông tin')
            return
        }

        setSaving(true)
        try {
            const token = await getToken()
            const { data } = await axios.put('/api/hotels/owner', formData, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                toast.success('Cập nhật thông tin khách sạn thành công')
                setHotel(data.hotel)
                setIsEditing(false)
                await fetchHotelInfo()
            } else {
                toast.error(data.message || 'Không thể cập nhật thông tin')
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra')
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        if (hotel) {
            setFormData({
                name: hotel.name || '',
                address: hotel.address || '',
                contact: hotel.contact || '',
                city: hotel.city || '',
            })
        }
        setIsEditing(false)
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ duyệt' },
            approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt' },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã từ chối' },
        }
        const config = statusConfig[status] || statusConfig.pending
        return (
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        )
    }

    if (!hotel) {
        return (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Khách sạn chưa được đăng ký
            </div>
        )
    }

    return (
        <div>
            <Title
                align="left"
                font="outfit"
                title="Thông tin khách sạn"
                subTitle="Quản lý và cập nhật thông tin khách sạn của bạn. Thông tin này sẽ hiển thị cho khách hàng khi họ tìm kiếm."
            />

            <div className="mt-8 bg-white rounded-lg shadow-md p-6 md:p-8">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">Thông tin cơ bản</h3>
                    <div className="flex items-center gap-3">
                        {getStatusBadge(hotel.status)}
                        {!isEditing && hotel.status === 'approved' && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Chỉnh sửa
                            </button>
                        )}
                    </div>
                </div>

                {hotel.status !== 'approved' && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                            {hotel.status === 'pending' 
                                ? 'Khách sạn của bạn đang chờ admin duyệt. Sau khi được duyệt, bạn có thể chỉnh sửa thông tin.'
                                : 'Khách sạn của bạn đã bị từ chối. Vui lòng liên hệ admin để biết thêm chi tiết.'}
                        </p>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Tên khách sạn */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên khách sạn <span className="text-red-500">*</span>
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập tên khách sạn"
                            />
                        ) : (
                            <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{hotel.name}</p>
                        )}
                    </div>

                    {/* Địa chỉ */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Địa chỉ <span className="text-red-500">*</span>
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập địa chỉ"
                            />
                        ) : (
                            <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{hotel.address}</p>
                        )}
                    </div>

                    {/* Thành phố */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Thành phố <span className="text-red-500">*</span>
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập thành phố"
                            />
                        ) : (
                            <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{hotel.city}</p>
                        )}
                    </div>

                    {/* Liên hệ */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số điện thoại liên hệ <span className="text-red-500">*</span>
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="contact"
                                value={formData.contact}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập số điện thoại"
                            />
                        ) : (
                            <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{hotel.contact}</p>
                        )}
                    </div>

                    {/* Thông tin bổ sung */}
                    <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Thông tin bổ sung</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-medium">Ngày đăng ký:</span>
                                <p className="mt-1">{new Date(hotel.createdAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div>
                                <span className="font-medium">Cập nhật lần cuối:</span>
                                <p className="mt-1">{new Date(hotel.updatedAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                            >
                                Hủy
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default HotelInfo

