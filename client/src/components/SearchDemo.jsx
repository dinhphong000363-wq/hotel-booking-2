import React, { useState } from "react";
import SearchModal from "./SearchModal";
import AlternativeDatesModal from "./AlternativeDatesModal";
import RoomAvailabilityBadge from "./RoomAvailabilityBadge";

/**
 * Demo component để test các chức năng search
 * Có thể xóa file này sau khi test xong
 */
const SearchDemo = () => {
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showAltDatesModal, setShowAltDatesModal] = useState(false);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Search Feature Demo</h1>

            {/* Search Modal Demo */}
            <div className="border p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">1. Search Modal</h2>
                <button
                    onClick={() => setShowSearchModal(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Open Search Modal
                </button>
                <p className="text-sm text-gray-600 mt-2">
                    Hoặc nhấn <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+K</kbd>
                </p>
            </div>

            {/* Availability Badge Demo */}
            <div className="border p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">2. Availability Badges</h2>
                <div className="space-y-3">
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Còn nhiều phòng (5 phòng):</p>
                        <RoomAvailabilityBadge availableRooms={5} isFullyBooked={false} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Sắp hết (2 phòng):</p>
                        <RoomAvailabilityBadge availableRooms={2} isFullyBooked={false} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Chỉ còn 1 phòng:</p>
                        <RoomAvailabilityBadge availableRooms={1} isFullyBooked={false} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Đã đầy:</p>
                        <RoomAvailabilityBadge availableRooms={0} isFullyBooked={true} />
                    </div>
                </div>
            </div>

            {/* Alternative Dates Modal Demo */}
            <div className="border p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">3. Alternative Dates Modal</h2>
                <button
                    onClick={() => setShowAltDatesModal(true)}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                    Show Alternative Dates
                </button>
                <p className="text-sm text-gray-600 mt-2">
                    (Cần có roomId, checkIn, checkOut thực tế để test)
                </p>
            </div>

            {/* API Endpoints */}
            <div className="border p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">4. API Endpoints</h2>
                <div className="space-y-2 text-sm font-mono">
                    <p className="text-green-600">GET /api/search/autocomplete?query=hanoi</p>
                    <p className="text-green-600">
                        GET /api/search/rooms?destination=hanoi&checkIn=2024-12-10&checkOut=2024-12-12
                    </p>
                    <p className="text-green-600">
                        GET /api/search/suggest-dates?roomId=xxx&checkIn=2024-12-10&checkOut=2024-12-12
                    </p>
                </div>
            </div>

            {/* Modals */}
            <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
            <AlternativeDatesModal
                isOpen={showAltDatesModal}
                onClose={() => setShowAltDatesModal(false)}
                roomId="test-room-id"
                checkIn="2024-12-10"
                checkOut="2024-12-12"
            />
        </div>
    );
};

export default SearchDemo;
