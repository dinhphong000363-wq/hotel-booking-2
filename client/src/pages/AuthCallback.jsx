import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppContext } from '../conext/AppContext';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setUser, setIsAdmin, setIsOwner, setUserRole } = useAppContext();

    useEffect(() => {
        let isMounted = true;
        const token = searchParams.get('token');

        if (token) {
            localStorage.setItem('token', token);

            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (!isMounted) return;

                    if (data.success) {
                        const userData = data.user;
                        localStorage.setItem('user', JSON.stringify(userData));

                        // Update all user states immediately
                        setUser(userData);
                        setUserRole(userData.role);
                        setIsAdmin(userData.role === 'admin');
                        setIsOwner(userData.role === 'hotelOwner');

                        toast.success('Đăng nhập thành công!');

                        // Redirect based on role
                        if (userData.role === 'admin') {
                            navigate('/admin/dashboard');
                        } else if (userData.role === 'hotelOwner') {
                            navigate('/owner');
                        } else {
                            navigate('/');
                        }
                    } else {
                        toast.error('Không thể lấy thông tin người dùng');
                        navigate('/login');
                    }
                })
                .catch(error => {
                    if (!isMounted) return;
                    console.error('Error fetching user profile:', error);
                    toast.error('Đã có lỗi xảy ra');
                    navigate('/login');
                });
        } else {
            if (isMounted) {
                toast.error('Token không hợp lệ');
                navigate('/login');
            }
        }

        return () => {
            isMounted = false;
        };
    }, [searchParams, navigate, setUser, setIsAdmin, setIsOwner, setUserRole]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang xử lý đăng nhập...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
