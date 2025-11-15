import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Title from '../components/Title'
import { useAppContext } from '../conext/AppContext'
import toast from 'react-hot-toast'

const PendingHotelInfo = () => {
    const { axios, getToken, user } = useAppContext()
    const navigate = useNavigate()
    const [hotel, setHotel] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchHotelInfo = async () => {
        try {
            setLoading(true)
            const token = await getToken()
            if (!token) {
                navigate('/')
                return
            }

            const { data } = await axios.get('/api/hotels/owner', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success && data.hotel) {
                setHotel(data.hotel)
                // Nếu hotel đã được approve, redirect đến owner dashboard
                if (data.hotel.status === 'approved') {
                    navigate('/owner/hotel-info')
                    return
                }
            } else {
                toast.error(data.message || 'Không thể tải thông tin khách sạn')
                navigate('/')
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra')
            navigate('/')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchHotelInfo()
        } else {
            navigate('/')
        }
    }, [user])

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Đang chờ phê duyệt', icon: '⏳' },
            approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt', icon: '✓' },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã từ chối', icon: '✗' },
        }
        const config = statusConfig[status] || statusConfig.pending
        return (
            <div className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full ${config.bg} ${config.text}`}>
                <span className="text-lg">{config.icon}</span>
                <span>{config.label}</span>
            </div>
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
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <Title
                    align="left"
                    font="outfit"
                    title="Thông tin đăng ký khách sạn"
                    subTitle="Xem lại thông tin đăng ký khách sạn của bạn. Khách sạn đang chờ admin phê duyệt."
                />

                <div className="mt-8 bg-white rounded-lg shadow-md p-6 md:p-8">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b">
                        <h3 className="text-xl font-semibold text-gray-800">Trạng thái đăng ký</h3>
                        {getStatusBadge(hotel.status)}
                    </div>

                    {/* Thông báo trạng thái */}
                    {hotel.status === 'pending' && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <svg className="h-5 w-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <p className="text-yellow-800 font-medium mb-1">Đang chờ phê duyệt</p>
                                    <p className="text-yellow-700 text-sm">
                                        Khách sạn của bạn đang chờ admin xem xét và phê duyệt. Sau khi được duyệt, bạn sẽ có quyền truy cập vào bảng điều khiển để quản lý khách sạn.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {hotel.status === 'rejected' && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <svg className="h-5 w-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <div>
                                    <p className="text-red-800 font-medium mb-1">Đăng ký bị từ chối</p>
                                    <p className="text-red-700 text-sm">
                                        Khách sạn của bạn đã bị từ chối. Vui lòng liên hệ admin để biết thêm chi tiết hoặc đăng ký lại với thông tin chính xác hơn.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Thông tin khách sạn */}
                    <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Thông tin khách sạn</h4>

                        {/* Tên khách sạn */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên khách sạn
                            </label>
                            <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800 border border-gray-200">
                                {hotel.name}
                            </p>
                        </div>

                        {/* Thành phố */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Thành phố
                            </label>
                            <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800 border border-gray-200">
                                {hotel.city}
                            </p>
                        </div>

                        {/* Quận/Huyện */}
                        {hotel.district && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quận/Huyện
                                </label>
                                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800 border border-gray-200">
                                    {hotel.district}
                                </p>
                            </div>
                        )}

                        {/* Đường */}
                        {hotel.street && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Đường
                                </label>
                                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800 border border-gray-200">
                                    {hotel.street}
                                </p>
                            </div>
                        )}

                        {/* Số nhà */}
                        {hotel.houseNumber && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số nhà
                                </label>
                                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800 border border-gray-200">
                                    {hotel.houseNumber}
                                </p>
                            </div>
                        )}

                        {/* Địa chỉ đầy đủ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Địa chỉ đầy đủ
                            </label>
                            <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800 border border-gray-200">
                                {hotel.fullAddress || hotel.address}
                            </p>
                        </div>

                        {/* Liên hệ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số điện thoại liên hệ
                            </label>
                            <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800 border border-gray-200">
                                {hotel.contact}
                            </p>
                        </div>

                        {/* Thông tin bổ sung */}
                        <div className="pt-4 border-t">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Thông tin bổ sung</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <span className="font-medium">Ngày đăng ký:</span>
                                    <p className="mt-1 text-gray-800">
                                        {new Date(hotel.createdAt).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-medium">Cập nhật lần cuối:</span>
                                    <p className="mt-1 text-gray-800">
                                        {new Date(hotel.updatedAt).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Nút quay lại */}
                        <div className="pt-4 border-t">
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Quay lại trang chủ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PendingHotelInfo

