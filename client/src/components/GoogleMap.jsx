import React, { useEffect, useRef, useState } from 'react'

const GoogleMap = ({ address, isExpanded = false, onExpand }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (!mapRef.current || !address) return;

        // Kiểm tra Google Maps API đã load chưa
        const checkGoogleMaps = () => {
            if (window.google && window.google.maps) {
                setIsLoading(false);
                initializeMap();
            } else {
                setTimeout(checkGoogleMaps, 100);
            }
        };

        const initializeMap = () => {
            if (!window.google || !window.google.maps) {
                setHasError(true);
                return;
            }

            // Geocode address to get coordinates
            const geocoder = new window.google.maps.Geocoder();
            
            geocoder.geocode({ address: address }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const location = results[0].geometry.location;
                    
                    const mapOptions = {
                        center: location,
                        zoom: isExpanded ? 16 : 14,
                        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
                        styles: [
                            {
                                featureType: "poi",
                                elementType: "labels",
                                stylers: [{ visibility: "off" }]
                            }
                        ]
                    };

                    if (!mapInstanceRef.current) {
                        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
                    } else {
                        mapInstanceRef.current.setCenter(location);
                        mapInstanceRef.current.setZoom(mapOptions.zoom);
                    }

                    // Xóa marker cũ nếu có
                    if (markerRef.current) {
                        markerRef.current.setMap(null);
                    }

                    // Add marker mới
                    markerRef.current = new window.google.maps.Marker({
                        position: location,
                        map: mapInstanceRef.current,
                        title: address,
                        animation: window.google.maps.Animation.DROP
                    });
                    
                    setHasError(false);
                } else {
                    console.error('Geocoding failed:', status);
                    setHasError(true);
                }
            });
        };

        checkGoogleMaps();
    }, [address, isExpanded]);

    return (
        <div className="relative w-full">
            <div
                ref={mapRef}
                className={`w-full bg-gray-200 rounded-xl overflow-hidden transition-all duration-500 ${
                    isExpanded ? 'h-[600px]' : 'h-[400px]'
                }`}
                onClick={onExpand}
                style={{ cursor: onExpand ? 'pointer' : 'default' }}
            >
                {isLoading && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Đang tải bản đồ...
                    </div>
                )}
                {hasError && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p className="mb-2">Không thể tải bản đồ</p>
                        <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline"
                        >
                            Mở trên Google Maps
                        </a>
                    </div>
                )}
            </div>
            {onExpand && !isLoading && !hasError && (
                <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-lg text-sm text-gray-700 z-10">
                    👆 Nhấn để xem bản đồ lớn hơn
                </div>
            )}
        </div>
    );
};

export default GoogleMap;

