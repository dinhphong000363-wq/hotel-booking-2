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
    
    const fetchRooms = async()=>{
        try {
            const {data} = await axios.get('/api/rooms')
            if(data.success){
                setRooms(data.rooms)
            }else{
                toast.error(data.message)
            }
        } catch (error) {   
            toast.error(error.message)
        }
    }

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
                setTimeout(()=>{
                    fetUser()
                },5000)
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
       if(user){
        fetUser()
       }
    }, [user]);

    useEffect(()=>{
        fetchRooms()
    },[])
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
    };

    return (
        <AppContext.Provider value={value}>
            {children}
            <Toaster position="top-center" />
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
