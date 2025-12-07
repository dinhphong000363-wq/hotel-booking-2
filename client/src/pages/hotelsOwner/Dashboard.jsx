import React, { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../conext/AppContext'
import toast from 'react-hot-toast'
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'
import { translateRoomType, translateBookingStatus } from '../../utils/translations'
import { exportOwnerDashboardPDF } from '../../utils/pdfExport'

const Dashboard = () => {
    const { currency, user, getToken, toast: toastContext, axios } = useAppContext()
    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState(false)
    const [activeTab, setActiveTab] = useState('overview') // 'overview', 'reviews', 'notifications'
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalRooms: 0,
        totalRevenue: 0,
        revenueGrowth: 0,
        revenueByMonth: [],
        bookingStatusData: { pending: 0, confirmed: 0, cancelled: 0, completed: 0 },
        averageRating: 0,
        totalReviews: 0,
        recentBookings: [],
        recentReviews: [],
        notifications: [],
        unreadNotifications: 0,
    })

    const fetchDashboardStats = async () => {
        try {
            setLoading(true)
            const token = await getToken()
            const { data } = await axios.get('/api/owner/dashboard/stats', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                setStats(data.stats)
            } else {
                toastContext.error(data.message || 'Không thể tải dữ liệu thống kê')
            }
        } catch (error) {
            toastContext.error(error.message || 'Có lỗi xảy ra')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchDashboardStats()
            // Refresh every 30 seconds
            const interval = setInterval(fetchDashboardStats, 30000)
            return () => clearInterval(interval)
        }
    }, [user])

    // Export dashboard to PDF
    const exportToPDF = () => {
        exportOwnerDashboardPDF(stats, currency, setExporting)
    }

    // Mark notification as read
    const markNotificationRead = async (notificationId) => {
        try {
            const token = await getToken()
            const { data } = await axios.put(`/api/owner/notifications/${notificationId}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                fetchDashboardStats()
            }
        } catch (error) {
            toastContext.error(error.message || 'Có lỗi xảy ra')
        }
    }

    // Mark all notifications as read
    const markAllNotificationsRead = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.put('/api/owner/notifications/read-all', {}, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                toastContext.success('Đã đánh dấu tất cả thông báo là đã đọc')
                fetchDashboardStats()
            }
        } catch (error) {
            toastContext.error(error.message || 'Có lỗi xảy ra')
        }
    }

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
    const PIE_COLORS = ['#f59e0b', '#10b981', '#ef4444', '#3b82f6']

    const bookingStatusChartData = [
        { name: 'Chờ xử lý', value: stats.bookingStatusData.pending || 0 },
        { name: 'Đã xác nhận', value: stats.bookingStatusData.confirmed || 0 },
        { name: 'Đã hủy', value: stats.bookingStatusData.cancelled || 0 },
        { name: 'Hoàn thành', value: stats.bookingStatusData.completed || 0 },
    ].filter(item => item.value > 0)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Title
                    align="left"
                    font="outfit"
                    title="Bảng điều khiển"
                    subTitle="Theo dõi danh sách phòng, theo dõi đặt phòng và phân tích doanh thu — tất cả tại một nơi."
                />
                <button
                    onClick={exportToPDF}
                    disabled={exporting || loading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                    {exporting ? (
                        <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Đang xuất...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Xuất PDF</span>
                        </>
                    )}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Tổng đặt phòng</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalBookings}</p>
                        </div>
                        <img src={assets.totalBookingIcon} alt="bookings" className="h-12 opacity-50" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Tổng doanh thu</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                {currency} {Number(stats.totalRevenue || 0).toLocaleString('vi-VN')}
                            </p>
                            {stats.revenueGrowth !== 0 && (
                                <p className={`text-xs mt-1 ${stats.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {stats.revenueGrowth > 0 ? '↑' : '↓'} {Math.abs(stats.revenueGrowth)}% so với tháng trước
                                </p>
                            )}
                        </div>
                        <img src={assets.totalRevenueIcon} alt="revenue" className="h-12 opacity-50" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Tổng phòng</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalRooms}</p>
                        </div>
                        <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🏨</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Đánh giá trung bình</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                                {stats.averageRating || 0} ⭐
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{stats.totalReviews} đánh giá</p>
                        </div>
                        <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">⭐</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === 'overview'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            📊 Tổng quan
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === 'reviews'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            ⭐ Đánh giá ({stats.totalReviews})
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 relative ${activeTab === 'notifications'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            🔔 Thông báo
                            {stats.unreadNotifications > 0 && (
                                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {stats.unreadNotifications}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Revenue Chart */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Doanh thu theo tháng (6 tháng gần nhất)</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={stats.revenueByMonth}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => `${currency} ${Number(value).toLocaleString('vi-VN')}`} />
                                        <Legend />
                                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Doanh thu" />
                                        <Line type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={2} name="Số đặt phòng" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Booking Status Chart */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Trạng thái đặt phòng</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={bookingStatusChartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {bookingStatusChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Doanh thu theo tháng</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={stats.revenueByMonth}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => `${currency} ${Number(value).toLocaleString('vi-VN')}`} />
                                            <Bar dataKey="revenue" fill="#3b82f6" name="Doanh thu" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recent Bookings */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Đặt phòng gần đây</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Khách hàng</th>
                                                <th className="px-4 py-3 text-left">Phòng</th>
                                                <th className="px-4 py-3 text-left">Ngày nhận</th>
                                                <th className="px-4 py-3 text-right">Tổng tiền</th>
                                                <th className="px-4 py-3 text-center">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.recentBookings.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                        Chưa có đặt phòng nào
                                                    </td>
                                                </tr>
                                            ) : (
                                                stats.recentBookings.map((booking) => (
                                                    <tr key={booking._id} className="border-t hover:bg-gray-50">
                                                        <td className="px-4 py-3">{booking.user?.username || 'N/A'}</td>
                                                        <td className="px-4 py-3">{translateRoomType(booking.room?.roomType) || 'N/A'}</td>
                                                        <td className="px-4 py-3">{new Date(booking.checkInDate).toLocaleDateString('vi-VN')}</td>
                                                        <td className="px-4 py-3 text-right font-semibold">
                                                            {currency} {Number(booking.totalPrice || 0).toLocaleString('vi-VN')}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`px-2 py-1 text-xs rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                        'bg-blue-100 text-blue-800'
                                                                }`}>
                                                                {translateBookingStatus(booking.status)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-4">
                            {stats.recentReviews.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Chưa có đánh giá nào
                                </div>
                            ) : (
                                stats.recentReviews.map((review) => (
                                    <div key={review._id} className="border rounded-lg p-4 hover:shadow-md transition">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1">
                                                <img
                                                    src={review.user?.avatar || assets.userIcon}
                                                    alt={review.user?.username}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-semibold">{review.user?.name || 'Khách'}</p>
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, i) => (
                                                                <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                                                    ⭐
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        Phòng: {translateRoomType(review.room?.roomType)}
                                                    </p>
                                                    {review.comment && (
                                                        <p className="text-gray-700">{review.comment}</p>
                                                    )}
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Thông báo</h3>
                                {stats.unreadNotifications > 0 && (
                                    <button
                                        onClick={markAllNotificationsRead}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        Đánh dấu tất cả đã đọc
                                    </button>
                                )}
                            </div>
                            {stats.notifications.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Không có thông báo nào
                                </div>
                            ) : (
                                stats.notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`border rounded-lg p-4 hover:shadow-md transition cursor-pointer ${!notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white'
                                            }`}
                                        onClick={() => !notification.isRead && markNotificationRead(notification._id)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-semibold">{notification.title}</p>
                                                    {!notification.isRead && (
                                                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                                                            Mới
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-700">{notification.message}</p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {new Date(notification.createdAt).toLocaleString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
