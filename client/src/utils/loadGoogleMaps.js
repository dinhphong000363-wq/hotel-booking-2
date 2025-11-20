// Utility to load Google Maps API dynamically
let isLoading = false;
let isLoaded = false;

export const loadGoogleMapsAPI = () => {
    return new Promise((resolve, reject) => {
        // Nếu đã load rồi thì return luôn
        if (isLoaded) {
            resolve(window.google);
            return;
        }

        // Nếu đang load thì chờ
        if (isLoading) {
            const checkLoaded = setInterval(() => {
                if (isLoaded) {
                    clearInterval(checkLoaded);
                    resolve(window.google);
                }
            }, 100);
            return;
        }

        isLoading = true;

        // Lấy API key từ biến môi trường
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
            console.error('Google Maps API key not configured. Please set VITE_GOOGLE_MAPS_API_KEY in .env file');
            reject(new Error('Google Maps API key not configured'));
            return;
        }

        // Tạo script tag để load Google Maps
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            isLoaded = true;
            isLoading = false;
            resolve(window.google);
        };

        script.onerror = () => {
            isLoading = false;
            reject(new Error('Failed to load Google Maps API'));
        };

        document.head.appendChild(script);
    });
};
