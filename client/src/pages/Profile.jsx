import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getAuthHeaders, logout as logoutUtil } from '../utils/authUtils';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`,
                { headers: getAuthHeaders() }
            );

            if (response.data.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Không thể lấy thông tin người dùng');

            if (error.response?.status === 401 || error.response?.status === 403) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logoutUtil();
        toast.success('Đăng xuất thành công');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                    <p className="mt-6 text-gray-600 font-medium">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-gray-600 text-lg">Không tìm thấy thông tin người dùng</p>
                </div>
            </div>
        );
    }

    const getProviderIcon = (provider) => {
        switch(provider) {
            case 'google':
                return (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                );
            case 'facebook':
                return (
                    <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Card với Avatar lớn */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden mb-8 relative">
                    {/* Decorative Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
                    </div>
                    
                    <div className="relative px-8 py-12 text-center">
                        {/* Avatar */}
                        <div className="mb-6 flex justify-center">
                            <div className="relative">
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt="Avatar"
                                        className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-blue-200"
                                    />
                                ) : (
                                    <div className="h-32 w-32 rounded-full bg-white border-4 border-white shadow-xl ring-4 ring-blue-200 flex items-center justify-center">
                                        <span className="text-4xl font-bold text-blue-600">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                {/* Status Badge */}
                                {user.isVerified && (
                                    <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5 border-4 border-white shadow-lg">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* User Name */}
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            {user.name}
                        </h1>
                        <p className="text-blue-100 text-lg">{user.email}</p>
                        
                        {/* Quick Stats */}
                        <div className="mt-8 flex justify-center gap-8">
                            <div className="text-center">
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
                                    <p className="text-white/80 text-sm mb-1">Trạng thái</p>
                                    <p className="text-white font-semibold text-lg">
                                        {user.isVerified ? '✓ Đã xác thực' : 'Chưa xác thực'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
                                    <p className="text-white/80 text-sm mb-1">Thành viên từ</p>
                                    <p className="text-white font-semibold text-lg">
                                        {new Date(user.createdAt).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Contact Info Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Thông tin liên hệ</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-1">Email</p>
                                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                                </div>
                            </div>
                            
                            {user.phone && (
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                    <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                                        <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Account Info Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-purple-100 p-3 rounded-xl">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Thông tin tài khoản</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="mt-0.5">
                                    {getProviderIcon(user.provider)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-1">Phương thức đăng nhập</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900">
                                            {user.provider === 'local' && 'Email/Password'}
                                            {user.provider === 'google' && 'Google'}
                                            {user.provider === 'facebook' && 'Facebook'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-1">Trạng thái xác thực</p>
                                    {user.isVerified ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                            </svg>
                                            Đã xác thực
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                            </svg>
                                            Chưa xác thực
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-1">Ngày tạo tài khoản</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/')}
                            className="group relative px-8 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Quay lại trang chủ
                        </button>
                        
                        <button
                            onClick={handleLogout}
                            className="group relative px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;