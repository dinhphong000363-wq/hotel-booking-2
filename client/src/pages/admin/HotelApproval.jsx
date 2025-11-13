import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../conext/AppContext'
import toast from 'react-hot-toast'
import ConfirmModal from '../../components/ConfirmModal'

const HotelApproval = () => {
    const { axios, getToken } = useAppContext();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectConfirm, setRejectConfirm] = useState(null); // { hotelId, hotelName }
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
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Duyệt Khách Sạn</h1>
            
            {hotels.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                    Không có khách sạn nào đang chờ duyệt
                </div>
            ) : (
                <div className="grid gap-4">
                    {hotels.map((hotel) => (
                        <div key={hotel._id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2">{hotel.name}</h3>
                                    <div className="space-y-1 text-gray-600">
                                        <p><span className="font-medium">Địa chỉ:</span> {hotel.address}</p>
                                        <p><span className="font-medium">Thành phố:</span> {hotel.city}</p>
                                        <p><span className="font-medium">Liên hệ:</span> {hotel.contact}</p>
                                        {hotel.owner && (
                                            <div className="mt-3 pt-3 border-t">
                                                <p className="font-medium text-gray-700">Chủ khách sạn:</p>
                                                <p className="text-sm">{hotel.owner.username}</p>
                                                <p className="text-sm text-gray-500">{hotel.owner.email}</p>
                                            </div>
                                        )}
                                        <p className="text-sm text-gray-400 mt-2">
                                            Đăng ký lúc: {new Date(hotel.createdAt).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => handleApprove(hotel._id)}
                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
                                    >
                                        Duyệt
                                    </button>
                                    <button
                                        onClick={() => handleRejectClick(hotel)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                                    >
                                        Từ chối
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
        </div>
    );
};

export default HotelApproval;

