import axios from 'axios'
import { createContext, useContext, useEffect, useState } from 'react';
import { data, useNavigate } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'
import toast, { Toaster } from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const currency = import.meta.env.VITE_CURRENCY || "$";
    const navigate = useNavigate();
    const { user } = useUser();
    const { getToken } = useAuth();

    const [isOwner, setIsOwner] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [showHotelReg, setShowHotelReg] = useState(false);
    const [searchedCities, setSearchedCities] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [hotelStatusUpdated, setHotelStatusUpdated] = useState(0); // Counter to trigger refresh

    const fetchRooms = async () => {
        try {
            const { data } = await axios.get('/api/rooms')
            if (data.success) {
                setRooms(data.rooms)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi tải danh sách phòng')
        }
    }

    const syncUser = async () => {
        try {
            const token = await getToken();
            if (!token || !user) return;

            // Sync user data to database
            await axios.post('/api/user/sync', {
                email: user.primaryEmailAddress?.emailAddress,
                username: user.fullName || user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0],
                image: user.imageUrl
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Sync user error:', error);
        }
    };

    const fetUser = async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const { data } = await axios.get('/api/user', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setUserRole(data.role);
                setIsOwner(data.role === "hotelOwner");
                setIsAdmin(data.role === "admin");
                setSearchedCities(data.recentSearchedCities || []);
            } else {
                // If user not found, sync and retry
                console.log('User not found, syncing...');
                await syncUser();
                setTimeout(() => {
                    fetUser()
                }, 2000)
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi tải thông tin người dùng');
        }
    };

    useEffect(() => {
        if (user) {
            // Sync user first, then fetch
            syncUser().then(() => {
                fetUser()
            });
        }
    }, [user]);

    useEffect(() => {
        fetchRooms()
    }, [])
    const value = {
        currency,
        navigate,
        user,
        getToken,
        isOwner,
        setIsOwner,
        isAdmin,
        setIsAdmin,
        userRole,
        setUserRole,
        axios,
        showHotelReg,
        setShowHotelReg,
        searchedCities,
        setSearchedCities,
        rooms,
        setRooms,
        fetchRooms,
        hotelStatusUpdated,
        setHotelStatusUpdated,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
            <Toaster position="top-center" />
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
