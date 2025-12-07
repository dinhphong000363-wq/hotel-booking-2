import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../conext/AppContext'
import toast from 'react-hot-toast'
import ConfirmModal from '../../components/ConfirmModal'
import { Building2, MapPin, Phone, User, Mail, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'

const HotelApproval = () => {
    const { axios, getToken } = useAppContext();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectConfirm, setRejectConfirm] = useState(null);
    const [rejecting, setRejecting] = useState(false);

    const fetchPendingHotels = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await axios.get('/api/admin/hotels/pending', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setHotels(data.hotels || []);
            } else {
                toast.error(data.message || 'Không thể tải danh sách khách sạn');
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingHotels();
    }, []);

    const handleApprove = async (hotelId) => {
        try {
            const token = await getToken();
            const { data } = await axios.put(`/api/admin/hotels/${hotelId}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success('Đã duyệt khách sạn thành công');
                fetchPendingHotels();
            } else {
                toast.error(data.message || 'Không thể duyệt khách sạn');
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    };

    const handleRejectClick = (hotel) => {
        setRejectConfirm({
            hotelId: hotel._id,
            hotelName: hotel.name
        });
    };

    const handleCloseRejectConfirm = () => {
        setRejectConfirm(null);
    };

    const handleReject = async () => {
        if (!rejectConfirm) return;

        setRejecting(true);
        try {
            const token = await getToken();
            const { data } = await axios.put(`/api/admin/hotels/${rejectConfirm.hotelId}/reject`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success('Đã từ chối khách sạn');
                handleCloseRejectConfirm();
                fetchPendingHotels();
            } else {
                toast.error(data.message || 'Không thể từ chối khách sạn');
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra');
        } finally {
            setRejecting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Building2 className="w-8 h-8 text-indigo-600 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 animate-fade-in">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-xl opacity-20"></div>
                        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-xl shadow-lg">
                                    <Building2 className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        Duyệt Khách Sạn
                                    </h1>
                                    <p className="text-gray-600 mt-1 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {hotels.length} khách sạn đang chờ phê duyệt
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {hotels.length === 0 ? (
                    <div className="relative animate-fade-in">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur-xl opacity-10"></div>
                        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-xl border border-white/50">
                            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Tất cả đã được xử lý!</h3>
                            <p className="text-gray-600">Không có khách sạn nào đang chờ duyệt</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {hotels.map((hotel, index) => (
                            <div
                                key={hotel._id}
                                className="relative group animate-slide-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                                        {/* Hotel Info */}
                                        <div className="flex-1">
                                            <div className="flex items-start gap-4 mb-6">
                                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg flex-shrink-0">
                                                    <Building2 className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-800 mb-1">{hotel.name}</h3>
                                                    <div className="inline-block px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-semibold rounded-full shadow-md">
                                                        Đang chờ duyệt
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                                <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                                    <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-500 mb-0.5">Địa chỉ</p>
                                                        <p className="text-sm text-gray-800">{hotel.address}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                                                    <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-500 mb-0.5">Thành phố</p>
                                                        <p className="text-sm text-gray-800">{hotel.city}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                                    <Phone className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-500 mb-0.5">Liên hệ</p>
                                                        <p className="text-sm text-gray-800">{hotel.contact}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                                                    <Calendar className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-500 mb-0.5">Đăng ký lúc</p>
                                                        <p className="text-sm text-gray-800">{new Date(hotel.createdAt).toLocaleString('vi-VN')}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {hotel.owner && (
                                                <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-slate-200">
                                                    <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                                        <User className="w-4 h-4 text-indigo-600" />
                                                        Hotel Manager
                                                    </p>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                                {hotel.owner.name?.charAt(0).toUpperCase() || 'U'}
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-800">{hotel.owner.name || 'N/A'}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 ml-10">
                                                            <Mail className="w-4 h-4 text-gray-400" />
                                                            <p className="text-sm text-gray-600">{hotel.owner.email || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex lg:flex-col gap-3 justify-center lg:justify-start">
                                            <button
                                                onClick={() => handleApprove(hotel._id)}
                                                className="group/btn flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold hover:scale-105 active:scale-95"
                                            >
                                                <CheckCircle className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                                                Duyệt
                                            </button>
                                            <button
                                                onClick={() => handleRejectClick(hotel)}
                                                className="group/btn flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold hover:scale-105 active:scale-95"
                                            >
                                                <XCircle className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                                                Từ chối
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal xác nhận từ chối */}
            <ConfirmModal
                isOpen={!!rejectConfirm}
                onClose={handleCloseRejectConfirm}
                onConfirm={handleReject}
                title="Xác nhận từ chối khách sạn"
                message={`Bạn có chắc chắn muốn từ chối khách sạn ${rejectConfirm?.hotelName || ''}? Hành động này không thể hoàn tác.`}
                confirmText="Từ chối"
                variant="warning"
                loading={rejecting}
                highlightText={rejectConfirm?.hotelName}
            />

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }

                .animate-slide-up {
                    animation: slide-up 0.6s ease-out backwards;
                }
            `}</style>
        </div>
    );
};

export default HotelApproval;