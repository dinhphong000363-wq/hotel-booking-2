import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../conext/AppContext'
import toast from 'react-hot-toast'
import ConfirmModal from '../../components/ConfirmModal'

const UserManagement = () => {
    const { axios, getToken, user } = useAppContext();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { userId, username }
    const [deleting, setDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await axios.get('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setUsers(data.users || []);
            } else {
                toast.error(data.message || 'Không thể tải danh sách người dùng');
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUpdateRole = async (userId) => {
        if (!selectedRole) {
            toast.error('Vui lòng chọn vai trò');
            return;
        }

        try {
            const token = await getToken();
            const { data } = await axios.put(`/api/admin/users/${userId}/role`,
                { role: selectedRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success('Cập nhật vai trò thành công');
                setEditingUser(null);
                setSelectedRole('');
                fetchUsers();
            } else {
                toast.error(data.message || 'Không thể cập nhật vai trò');
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleDeleteClick = (user) => {
        setDeleteConfirm({
            userId: user._id,
            username: user.name
        });
    };

    const handleCloseDeleteConfirm = () => {
        setDeleteConfirm(null);
    };

    const handleDeleteUser = async () => {
        if (!deleteConfirm) return;

        setDeleting(true);
        try {
            const token = await getToken();
            const { data } = await axios.delete(`/api/admin/users/${deleteConfirm.userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success('Đã xóa người dùng');
                handleCloseDeleteConfirm();
                fetchUsers();
            } else {
                toast.error(data.message || 'Không thể xóa người dùng');
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra');
        } finally {
            setDeleting(false);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg';
            case 'hotelOwner':
                return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg';
            default:
                return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg';
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin':
                return 'Quản trị viên';
            case 'hotelOwner':
                return 'Hotel Manager';
            default:
                return 'Người dùng';
        }
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">
                        👤
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                            <span className="text-3xl">👥</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Quản Lý Người Dùng
                            </h1>
                            <p className="text-gray-600 mt-1">Quản lý và phân quyền người dùng trong hệ thống</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Tổng người dùng</p>
                                <p className="text-3xl font-bold text-gray-800 mt-2">{users.length}</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                <span className="text-3xl">👥</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Quản trị viên</p>
                                <p className="text-3xl font-bold text-gray-800 mt-2">
                                    {users.filter(u => u.role === 'admin').length}
                                </p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                                <span className="text-3xl">👑</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Hotel Manager</p>
                                <p className="text-3xl font-bold text-gray-800 mt-2">
                                    {users.filter(u => u.role === 'hotelOwner').length}
                                </p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
                                <span className="text-3xl">🛡️</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                        />
                    </div>
                </div>

                {/* Users Table */}
                {filteredUsers.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                        <div className="flex justify-center mb-4">
                            <div className="p-6 bg-gray-100 rounded-full">
                                <span className="text-6xl">👥</span>
                            </div>
                        </div>
                        <p className="text-gray-500 text-lg">
                            {searchTerm ? 'Không tìm thấy người dùng nào' : 'Không có người dùng nào'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Người dùng
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Vai trò
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Ngày tạo
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.map((u) => (
                                        <tr 
                                            key={u._id}
                                            className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                                        >
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {u.avatar ? (
                                                        <img
                                                            className="h-12 w-12 rounded-full mr-4 object-cover ring-2 ring-blue-100 shadow-md"
                                                            src={u.avatar}
                                                            alt={u.name}
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-full mr-4 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-blue-100">
                                                            {u.name?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {u.name}
                                                        </div>
                                                        {u._id === user?.id && (
                                                            <span className="text-xs text-blue-600 font-medium">(Bạn)</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span>📧</span>
                                                    {u.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                {editingUser === u._id ? (
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={selectedRole || u.role}
                                                            onChange={(e) => setSelectedRole(e.target.value)}
                                                            className="text-sm border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        >
                                                            <option value="user">Người dùng</option>
                                                            <option value="hotelOwner">Hotel Manager</option>
                                                            <option value="admin">Quản trị viên</option>
                                                        </select>
                                                        <button
                                                            onClick={() => handleUpdateRole(u._id)}
                                                            className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 shadow-md hover:shadow-lg transition-all font-medium"
                                                        >
                                                            ✓ Lưu
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingUser(null);
                                                                setSelectedRole('');
                                                            }}
                                                            className="px-3 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 shadow-md hover:shadow-lg transition-all font-medium"
                                                        >
                                                            ✕ Hủy
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${getRoleBadgeColor(u.role)}`}>
                                                        {u.role === 'admin' ? '👑' : u.role === 'hotelOwner' ? '🛡️' : '👤'}
                                                        {getRoleLabel(u.role)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span>📅</span>
                                                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingUser(u._id);
                                                            setSelectedRole(u.role);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all"
                                                    >
                                                        ✏️ Sửa
                                                    </button>
                                                    {u._id !== user?.id && (
                                                        <button
                                                            onClick={() => handleDeleteClick(u)}
                                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 shadow-md hover:shadow-lg transition-all"
                                                        >
                                                            🗑️ Xóa
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Modal xác nhận xóa */}
                <ConfirmModal
                    isOpen={!!deleteConfirm}
                    onClose={handleCloseDeleteConfirm}
                    onConfirm={handleDeleteUser}
                    title="Xác nhận xóa người dùng"
                    message={`Bạn có chắc chắn muốn xóa người dùng ${deleteConfirm?.username || ''}? Hành động này không thể hoàn tác.`}
                    confirmText="Xóa"
                    variant="danger"
                    loading={deleting}
                    highlightText={deleteConfirm?.username}
                />
            </div>
        </div>
    );
};

export default UserManagement;