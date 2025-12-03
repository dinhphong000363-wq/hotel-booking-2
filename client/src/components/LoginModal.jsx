import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAppContext } from '../conext/AppContext';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser, setIsAdmin, setIsOwner, setUserRole } = useAppContext();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const error = searchParams.get('error');
        if (error && isOpen) {
            if (error === 'google_auth_failed') {
                toast.error('Đăng nhập Google thất bại');
            } else if (error === 'authentication_failed') {
                toast.error('Xác thực thất bại');
            } else if (error === 'server_error') {
                toast.error('Lỗi server');
            }
        }
    }, [searchParams, isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
                formData
            );

            if (response.data.success) {
                const userData = response.data.user;
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(userData));

                // Update all user states immediately
                setUser(userData);
                setUserRole(userData.role);
                setIsAdmin(userData.role === 'admin');
                setIsOwner(userData.role === 'hotelOwner');

                toast.success('Đăng nhập thành công!');
                onClose();

                // Redirect based on role using navigate
                if (userData.role === 'admin') {
                    navigate('/admin/dashboard');
                } else if (userData.role === 'hotelOwner') {
                    navigate('/owner');
                } else {
                    navigate('/');
                }
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Đăng nhập thất bại';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto"
            onClick={onClose}
            style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
            }}
        >
            <div
                className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full my-auto transform transition-all animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
                style={{
                    animation: 'scaleIn 0.3s ease-out'
                }}
            >
                {/* Decorative elements */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

                {/* Header with stunning gradient */}
                <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-t-3xl p-8 text-white overflow-hidden">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse"></div>
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                    </div>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="absolute top-5 right-5 text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all hover:rotate-90 transform duration-300 backdrop-blur-sm z-10"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="relative flex items-center gap-4">
                        <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30 shadow-lg">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Chào mừng trở lại! 👋</h2>
                            <p className="text-blue-100 text-sm mt-1.5 font-medium">Đăng nhập để tiếp tục hành trình</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-bold text-gray-800 flex items-center gap-2">
                                <span className="text-lg">📧</span>
                                Email
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800 placeholder:text-gray-400 hover:border-gray-300"
                                    placeholder="example@email.com"
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-bold text-gray-800 flex items-center gap-2">
                                <span className="text-lg">🔒</span>
                                Mật khẩu
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800 placeholder:text-gray-400 hover:border-gray-300"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 py-4 px-6 border-none rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span className="relative flex items-center gap-2">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <span className="text-xl">🚀</span>
                                        Đăng nhập
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-white text-gray-500 font-bold text-sm">Hoặc tiếp tục với</span>
                            </div>
                        </div>

                        {/* Google login button */}
                        <button
                            onClick={handleGoogleLogin}
                            className="mt-6 w-full inline-flex justify-center items-center gap-3 py-4 px-6 border-2 border-gray-200 rounded-xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98] group"
                        >
                            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>Đăng nhập với Google</span>
                        </button>
                    </div>

                    {/* Register link */}
                    <div className="mt-8 text-center">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-100">
                            <p className="text-sm text-gray-700 font-medium">
                                Chưa có tài khoản?{' '}
                                <button
                                    onClick={onSwitchToRegister}
                                    className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all inline-flex items-center gap-1 group"
                                >
                                    Đăng ký ngay
                                    <svg className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom accent */}
                <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-b-3xl"></div>
            </div>

            <style jsx>{`
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default LoginModal;