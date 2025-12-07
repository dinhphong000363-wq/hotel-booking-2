import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../conext/AppContext";
import { assets } from "../assets/assets";

const SearchModal = ({ isOpen, onClose }) => {
    const { axios, navigate } = useAppContext();
    const [searchQuery, setSearchQuery] = useState("");
    const [destination, setDestination] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(1);
    const [onlyAvailable, setOnlyAvailable] = useState(false);

    const [suggestions, setSuggestions] = useState({ hotels: [], rooms: [] });
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);

    const searchInputRef = useRef(null);
    const modalRef = useRef(null);

    // Load search history from localStorage
    useEffect(() => {
        const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
        setSearchHistory(history);
    }, []);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // Close modal on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    // Autocomplete search
    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                try {
                    const { data } = await axios.get(
                        `/api/search/autocomplete?query=${searchQuery}`
                    );
                    if (data.success) {
                        setSuggestions(data);
                        setShowSuggestions(true);
                    }
                } catch (error) {
                    console.error("Autocomplete error:", error);
                }
            } else {
                setSuggestions({ hotels: [], rooms: [] });
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery, axios]);

    // Save to search history
    const saveToHistory = (searchData) => {
        const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
        const newHistory = [
            searchData,
            ...history.filter((h) => h.destination !== searchData.destination),
        ].slice(0, 5); // Keep only 5 recent searches
        localStorage.setItem("searchHistory", JSON.stringify(newHistory));
        setSearchHistory(newHistory);
    };

    // Handle search
    const handleSearch = async (e) => {
        e?.preventDefault();

        if (!destination.trim()) {
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams({
                destination,
                ...(checkIn && { checkIn }),
                ...(checkOut && { checkOut }),
                ...(guests && { guests }),
                ...(onlyAvailable && { onlyAvailable: "true" }),
            });

            // Save to history
            saveToHistory({ destination, checkIn, checkOut, guests, timestamp: Date.now() });

            // Navigate to search results
            navigate(`/rooms?${params.toString()}`);
            onClose();
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (item, type) => {
        if (type === "hotel") {
            setDestination(item.name);
        } else if (type === "room") {
            setDestination(item.hotel.name);
        }
        setShowSuggestions(false);
        setSearchQuery("");
    };

    // Handle history click
    const handleHistoryClick = (historyItem) => {
        setDestination(historyItem.destination);
        setCheckIn(historyItem.checkIn || "");
        setCheckOut(historyItem.checkOut || "");
        setGuests(historyItem.guests || 1);
    };

    // Clear history
    const clearHistory = () => {
        localStorage.removeItem("searchHistory");
        setSearchHistory([]);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                ref={modalRef}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto animate-slideDown"
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">Tìm kiếm phòng</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <img src={assets.closeIcon} alt="close" className="h-5 w-5" />
                    </button>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="p-6 space-y-4">
                    {/* Destination with Autocomplete */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Điểm đến <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <img
                                src={assets.searchIcon}
                                alt="search"
                                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                            />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={destination}
                                onChange={(e) => {
                                    setDestination(e.target.value);
                                    setSearchQuery(e.target.value);
                                }}
                                placeholder="Tìm khách sạn, thành phố, địa điểm..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            💡 Gõ ít nhất 2 ký tự để xem gợi ý khách sạn
                        </p>

                        {/* Autocomplete Suggestions */}
                        {showSuggestions && (suggestions.hotels.length > 0 || suggestions.rooms.length > 0) && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                {suggestions.hotels.length > 0 && (
                                    <div className="p-2">
                                        <p className="text-xs font-semibold text-gray-500 px-2 py-1">
                                            KHÁCH SẠN
                                        </p>
                                        {suggestions.hotels.map((hotel) => (
                                            <button
                                                key={hotel._id}
                                                type="button"
                                                onClick={() => handleSuggestionClick(hotel, "hotel")}
                                                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition-colors"
                                            >
                                                <p className="font-medium text-gray-800">{hotel.name}</p>
                                                <p className="text-sm text-gray-500">{hotel.city}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {suggestions.rooms.length > 0 && (
                                    <div className="p-2 border-t">
                                        <p className="text-xs font-semibold text-gray-500 px-2 py-1">
                                            LOẠI PHÒNG
                                        </p>
                                        {suggestions.rooms.map((room) => (
                                            <button
                                                key={room._id}
                                                type="button"
                                                onClick={() => handleSuggestionClick(room, "room")}
                                                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition-colors"
                                            >
                                                <p className="font-medium text-gray-800">{room.roomType}</p>
                                                <p className="text-sm text-gray-500">
                                                    {room.hotel.name} - {room.pricePerNight.toLocaleString()}đ/đêm
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ngày nhận phòng
                            </label>
                            <input
                                type="date"
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">Tùy chọn - để xem phòng còn trống</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ngày trả phòng
                            </label>
                            <input
                                type="date"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                                min={checkIn || new Date().toISOString().split("T")[0]}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">Tùy chọn - để xem phòng còn trống</p>
                        </div>
                    </div>

                    {/* Guests */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số khách
                        </label>
                        <input
                            type="number"
                            value={guests}
                            onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                            max="10"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Only Available Checkbox */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="onlyAvailable"
                            checked={onlyAvailable}
                            onChange={(e) => setOnlyAvailable(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="onlyAvailable" className="text-sm text-gray-700">
                            Chỉ hiển thị phòng còn trống
                        </label>
                    </div>

                    {/* Search Button */}
                    <button
                        type="submit"
                        disabled={loading || !destination.trim()}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {loading ? "Đang tìm kiếm..." : "Tìm kiếm"}
                    </button>
                </form>

                {/* Search History */}
                {searchHistory.length > 0 && (
                    <div className="border-t px-6 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-700">
                                Tìm kiếm gần đây
                            </h3>
                            <button
                                onClick={clearHistory}
                                className="text-xs text-red-600 hover:text-red-700"
                            >
                                Xóa tất cả
                            </button>
                        </div>
                        <div className="space-y-2">
                            {searchHistory.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleHistoryClick(item)}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                                >
                                    <p className="font-medium text-gray-800 text-sm">
                                        {item.destination}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {item.checkIn && item.checkOut
                                            ? `${item.checkIn} → ${item.checkOut}`
                                            : "Không có ngày"}{" "}
                                        • {item.guests} khách
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Keyboard Shortcut Hint */}
                <div className="border-t px-6 py-3 bg-gray-50 text-xs text-gray-500 text-center">
                    Nhấn <kbd className="px-2 py-1 bg-white border rounded">Esc</kbd> để đóng
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
