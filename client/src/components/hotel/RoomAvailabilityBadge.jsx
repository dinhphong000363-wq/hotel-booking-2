import React from "react";

const RoomAvailabilityBadge = ({ availableRooms, isFullyBooked, totalRooms = 5 }) => {
    if (!availableRooms && availableRooms !== 0) {
        return null; // Không hiển thị nếu không có thông tin availability
    }

    if (isFullyBooked || availableRooms === 0) {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                    />
                </svg>
                Đã đầy
            </div>
        );
    }

    if (availableRooms <= 2) {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium animate-pulse">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                    />
                </svg>
                Chỉ còn {availableRooms} phòng
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                />
            </svg>
            Còn {availableRooms} phòng
        </div>
    );
};

export default RoomAvailabilityBadge;
