import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { assets } from '../../assets/assets'
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
import { exportAdminDashboardPDF } from '../../utils/pdfExport'

const AdminDashboard = () => {
    const { axios, getToken, currency } = useAppContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalHotels: 0,
        totalRooms: 0,
        totalBookings: 0,
        totalRevenue: 0,
        revenueGrowth: 0,
        revenueByMonth: [],
        bookingStatusData: { pending: 0, confirmed: 0, cancelled: 0 },
        userRoleData: { user: 0, hotelOwner: 0, admin: 0 },
        pendingHotels: [],
        reportedUsers: [],
    });

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await axios.get('/api/admin/dashboard/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setStats(data.stats);
            } else {
                toast.error(data.message || 'Không thể tải dữ liệu thống kê');
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const exportToPDF = () => {
        exportAdminDashboardPDF(stats, currency, setExporting);
    };

    // Colors for charts
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const PIE_COLORS = ['#3b82f6', '#10b981', '#ef4444'];

    // Prepare booking status data for pie chart
    const bookingStatusChartData = [
        { name: 'Đã xác nhận', value: stats.bookingStatusData.confirmed || 0, color: COLORS[1] },
        { name: 'Chờ xử lý', value: stats.bookingStatusData.pending || 0, color: COLORS[0] },
        { name: 'Đã hủy', value: stats.bookingStatusData.cancelled || 0, color: COLORS[3] },
    ].filter(item => item.value > 0);

    // Prepare user role data for pie chart
    const userRoleChartData = [
        { name: 'Người dùng', value: stats.userRoleData.user || 0, color: COLORS[0] },
        { name: 'Hotel Manager', value: stats.userRoleData.hotelOwner || 0, color: COLORS[1] },
        { name: 'Quản trị viên', value: stats.userRoleData.admin || 0, color: COLORS[4] },
    ].filter(item => item.value > 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-2">📊 Thống kê</h1>
                    <p className="text-gray-600">Tổng quan toàn hệ thống</p>
                </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Total Users */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Tổng số người dùng</p>
                            <p className="text-2xl font-bold text-gray-800 mt-2">{stats.totalUsers}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <img src={assets.userIcon} alt="users" className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Total Hotels */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Tổng số khách sạn</p>
                            <p className="text-2xl font-bold text-gray-800 mt-2">{stats.totalHotels}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <img src={assets.homeIcon} alt="hotels" className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Total Rooms */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Tổng số phòng</p>
                            <p className="text-2xl font-bold text-gray-800 mt-2">{stats.totalRooms}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <img src={assets.badgeIcon} alt="rooms" className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Total Bookings */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Tổng số đặt phòng</p>
                            <p className="text-2xl font-bold text-gray-800 mt-2">{stats.totalBookings}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <img src={assets.totalBookingIcon} alt="bookings" className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Tổng doanh thu</p>
                            <p className="text-2xl font-bold text-gray-800 mt-2">
                                {currency}{stats.totalRevenue.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <img src={assets.totalRevenueIcon} alt="revenue" className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Revenue Growth */}
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Tăng trưởng doanh thu</p>
                            <p className={`text-2xl font-bold mt-2 ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}%
                            </p>
                            <p className="text-xs text-gray-400 mt-1">So với tháng trước</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Month - Bar Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Doanh thu theo Tháng</h2>
                    {stats.revenueByMonth.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.revenueByMonth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${currency}${value.toLocaleString()}`} />
                                <Legend />
                                <Bar dataKey="revenue" fill="#3b82f6" name="Doanh thu" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            Chưa có dữ liệu
                        </div>
                    )}
                </div>

                {/* Revenue by Month - Line Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Xu hướng Doanh thu</h2>
                    {stats.revenueByMonth.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats.revenueByMonth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${currency}${value.toLocaleString()}`} />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Doanh thu" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            Chưa có dữ liệu
                        </div>
                    )}
                </div>

                {/* Booking Status Distribution - Pie Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Tỷ lệ Trạng thái Đặt phòng</h2>
                    {bookingStatusChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
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
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            Chưa có dữ liệu
                        </div>
                    )}
                </div>

                {/* User Role Distribution - Pie Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Tỷ lệ Vai trò Người dùng</h2>
                    {userRoleChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={userRoleChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {userRoleChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            Chưa có dữ liệu
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Hotels Table */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Khách sạn chờ duyệt</h2>
                        <button
                            onClick={() => navigate('/admin/approval')}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Xem tất cả →
                        </button>
                    </div>
                    {stats.pendingHotels.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Không có khách sạn nào chờ duyệt</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Khách sạn</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Chủ sở hữu</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ngày đăng ký</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {stats.pendingHotels.map((hotel) => (
                                        <tr key={hotel._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{hotel.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {hotel.owner?.username || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {new Date(hotel.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Reported Users Table */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Người dùng bị báo cáo</h2>
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Xem tất cả →
                        </button>
                    </div>
                    {stats.reportedUsers.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Không có người dùng nào bị báo cáo</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số lần báo cáo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {stats.reportedUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.username}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{user.reportCount || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

