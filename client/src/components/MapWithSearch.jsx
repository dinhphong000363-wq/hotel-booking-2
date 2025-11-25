import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icon issue with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component để thay đổi view khi address thay đổi
const ChangeView = ({ center, zoom }) => {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);

    return null;
};

const MapWithSearch = ({ address, isExpanded = false }) => {
    const [coordinates, setCoordinates] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const defaultCenter = [16.0544, 108.2022]; // Đà Nẵng mặc định
    const zoom = isExpanded ? 16 : 14;

    useEffect(() => {
        if (!address) {
            setLoading(false);
            return;
        }

        // Geocode address using Nominatim API (miễn phí)
        const geocodeAddress = async () => {
            try {
                setLoading(true);
                setError(false);

                // Thử nhiều cách tìm kiếm
                const searchQueries = [
                    address, // Địa chỉ đầy đủ
                    `${address}, Vietnam`, // Thêm Vietnam
                    address.split(',').slice(-2).join(',').trim() + ', Vietnam', // Chỉ lấy quận/thành phố
                ];

                let found = false;

                for (const query of searchQueries) {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=vn`,
                        {
                            headers: {
                                'User-Agent': 'HotelBookingApp/1.0'
                            }
                        }
                    );

                    const data = await response.json();

                    if (data && data.length > 0) {
                        const { lat, lon } = data[0];
                        setCoordinates([parseFloat(lat), parseFloat(lon)]);
                        setError(false);
                        found = true;
                        break;
                    }

                    // Đợi 1 giây giữa các request để tránh rate limit
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                if (!found) {
                    console.warn('Không tìm thấy tọa độ, sử dụng vị trí mặc định');
                    // Sử dụng tọa độ mặc định của thành phố trong địa chỉ
                    if (address.includes('Đà Nẵng')) {
                        setCoordinates([16.0544, 108.2022]); // Đà Nẵng
                    } else if (address.includes('Hà Nội')) {
                        setCoordinates([21.0285, 105.8542]); // Hà Nội
                    } else if (address.includes('Hồ Chí Minh') || address.includes('Sài Gòn')) {
                        setCoordinates([10.8231, 106.6297]); // TP.HCM
                    } else {
                        setCoordinates(defaultCenter); // Mặc định Đà Nẵng
                    }
                    setError(false); // Không hiển thị lỗi, chỉ dùng vị trí gần đúng
                }
            } catch (err) {
                console.error('Lỗi khi geocode địa chỉ:', err);
                setCoordinates(defaultCenter);
                setError(false); // Không hiển thị lỗi, dùng vị trí mặc định
            } finally {
                setLoading(false);
            }
        };

        geocodeAddress();
    }, [address]);

    const center = coordinates || defaultCenter;

    if (loading) {
        return (
            <div className={`flex items-center justify-center bg-gray-200 rounded-xl ${isExpanded ? 'h-[600px]' : 'h-[400px]'}`}>
                <div className="text-gray-500">Đang tải bản đồ...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center bg-gray-200 rounded-xl ${isExpanded ? 'h-[600px]' : 'h-[400px]'}`}>
                <p className="text-gray-500 mb-2">Không thể tải bản đồ</p>
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                >
                    Mở trên Google Maps
                </a>
            </div>
        );
    }

    return (
        <div className={`rounded-xl overflow-hidden ${isExpanded ? 'h-[600px]' : 'h-[400px]'}`}>
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                zoomControl={true}
                attributionControl={true}
            >
                <ChangeView center={center} zoom={zoom} />

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                    minZoom={3}
                />

                {coordinates && (
                    <Marker position={coordinates}>
                        <Popup>
                            <div className="text-sm font-medium">
                                <strong>{address}</strong>
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
};

export default MapWithSearch;
