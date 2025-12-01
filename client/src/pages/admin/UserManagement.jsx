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
                return 'bg-purple-100 text-purple-800';
            case 'hotelOwner':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin':
                return 'Quản trị viên';
            case 'hotelOwner':
                return 'Chủ khách sạn';
            default:
                return 'Người dùng';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Quản Lý Người Dùng</h1>

            {users.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                    Không có người dùng nào
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Người dùng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vai trò
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày tạo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((u) => (
                                    <tr key={u._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {u.avatar ? (
                                                    <img
                                                        className="h-10 w-10 rounded-full mr-3 object-cover"
                                                        src={u.avatar}
                                                        alt={u.name}
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full mr-3 bg-blue-600 flex items-center justify-center text-white font-medium">
                                                        {u.name?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {u.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{u.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingUser === u._id ? (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={selectedRole || u.role}
                                                        onChange={(e) => setSelectedRole(e.target.value)}
                                                        className="text-sm border rounded px-2 py-1"
                                                    >
                                                        <option value="user">Người dùng</option>
                                                        <option value="hotelOwner">Chủ khách sạn</option>
                                                        <option value="admin">Quản trị viên</option>
                                                    </select>
                                                    <button
                                                        onClick={() => handleUpdateRole(u._id)}
                                                        className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                                    >
                                                        Lưu
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingUser(null);
                                                            setSelectedRole('');
                                                        }}
                                                        className="text-sm bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(u.role)}`}>
                                                    {getRoleLabel(u.role)}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(u._id);
                                                        setSelectedRole(u.role);
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Sửa
                                                </button>
                                                {u._id !== user?.id && (
                                                    <button
                                                        onClick={() => handleDeleteClick(u)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Xóa
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
    );
};

export default UserManagement;

