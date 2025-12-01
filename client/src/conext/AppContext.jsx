import axios from 'axios'
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast';
import { getToken as getAuthToken, getUser as getAuthUser } from '../utils/authUtils';

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const currency = import.meta.env.VITE_CURRENCY || "$";
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const [isOwner, setIsOwner] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [showHotelReg, setShowHotelReg] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
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

    const getToken = () => {
        return getAuthToken();
    };

    const fetUser = async () => {
        try {
            const token = getToken();
            if (!token) return;

            const { data } = await axios.get('/api/user', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setUserRole(data.role);
                setIsOwner(data.role === "hotelOwner");
                setIsAdmin(data.role === "admin");
                setSearchedCities(data.recentSearchedCities || []);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    useEffect(() => {
        const authUser = getAuthUser();
        if (authUser) {
            // Validate user ID format (MongoDB ObjectId is 24 hex chars)
            if (authUser.id && authUser.id.match(/^[0-9a-fA-F]{24}$/)) {
                setUser(authUser);
                // Set role states from user object immediately
                const role = authUser.role || 'user';
                setUserRole(role);
                setIsAdmin(role === 'admin');
                setIsOwner(role === 'hotelOwner');
                // Then fetch additional data
                fetUser();
            } else {
                // Old Clerk user detected, clear it
                console.warn('Old Clerk user detected, clearing...');
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
    }, []);

    useEffect(() => {
        fetchRooms()
    }, [])
    const value = {
        currency,
        navigate,
        user,
        setUser,
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
        showLoginModal,
        setShowLoginModal,
        showRegisterModal,
        setShowRegisterModal,
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
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
