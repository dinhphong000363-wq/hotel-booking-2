import React, { useState, useEffect } from "react";
import { useAppContext } from "../conext/AppContext";
import { assets } from "../assets/assets";

const AlternativeDatesModal = ({ isOpen, onClose, roomId, checkIn, checkOut }) => {
    const { axios } = useAppContext();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && roomId && checkIn && checkOut) {
            loadSuggestions();
        }
    }, [isOpen, roomId, checkIn, checkOut]);

    const loadSuggestions = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                `/api/search/suggest-dates?roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}`
            );

            if (data.success) {
                setSuggestions(data.suggestions);
            }
        } catch (error) {
            console.error("Error loading suggestions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectDate = (suggestion) => {
        // Có thể thêm logic để tự động điền ngày vào form booking
        onClose(suggestion);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slideDown">
                {/* Header */}
                <div className="border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Gợi ý ngày khác
                    </h2>
                    <button
                        onClick={() => onClose()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <img src={assets.closeIcon} alt="close" className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                    ) : suggestions.length > 0 ? (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600 mb-4">
                                Phòng đã đầy cho ngày bạn chọn. Dưới đây là các ngày còn trống:
                            </p>
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelectDate(suggestion)}
                                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {new Date(suggestion.checkIn).toLocaleDateString("vi-VN")} -{" "}
                                                {new Date(suggestion.checkOut).toLocaleDateString("vi-VN")}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {suggestion.daysFromOriginal === 1
                                                    ? "Ngày hôm sau"
                                                    : `${suggestion.daysFromOriginal} ngày sau`}
                                            </p>
                                        </div>
                                        <svg
                                            className="h-5 w-5 text-blue-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500">
                                Không tìm thấy ngày trống trong 30 ngày tới
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t px-6 py-4 bg-gray-50 text-center">
                    <button
                        onClick={() => onClose()}
                        className="text-sm text-gray-600 hover:text-gray-800"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlternativeDatesModal;
