import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import { useClerk, UserButton } from "@clerk/clerk-react";
import { useAppContext } from "../conext/AppContext";

const BookIcon = () => {
    return (
        <svg
            className="w-6 h-6 text-gray-700"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12M9 3v4m7 0V3"
            />
        </svg>
    );
};

const HeartIcon = () => {
    return (
        <svg
            className="w-6 h-6 text-gray-700"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3.172 5.172a4 4 0 015.656 0L12 8.343l3.172-3.171a4 4 0 115.656 5.656L12 21.657 3.172 10.828a4 4 0 010-5.656z"
            />
        </svg>
    );
};

const Navbar = () => {
    const navLinks = [
        { name: "Trang chủ", path: "/" },
        { name: "Khách sạn", path: "/rooms" },
        { name: "Trải nghiệm", path: "/" },
        { name: "Giới thiệu", path: "/" },
    ];

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hotelStatus, setHotelStatus] = useState(null); // null, 'pending', 'approved', 'rejected'
    const [loadingHotelStatus, setLoadingHotelStatus] = useState(false);
    const { openSignIn } = useClerk();
    const location = useLocation();
    const { user, navigate, isOwner, isAdmin, setShowHotelReg, axios, getToken, hotelStatusUpdated } = useAppContext();

    // Fetch hotel status if user is not owner or admin
    useEffect(() => {
        const checkHotelStatus = async () => {
            if (!user || isOwner || isAdmin) {
                setHotelStatus(null);
                return;
            }

            try {
                setLoadingHotelStatus(true);
                const token = await getToken();
                if (!token) return;

                const { data } = await axios.get('/api/hotels/owner', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.success && data.hotel) {
                    setHotelStatus(data.hotel.status); // 'pending', 'approved', 'rejected'
                } else {
                    setHotelStatus(null); // No hotel registered
                }
            } catch (error) {
                // If 404 or no hotel, set to null
                setHotelStatus(null);
            } finally {
                setLoadingHotelStatus(false);
            }
        };

        checkHotelStatus();
    }, [user, isOwner, isAdmin, axios, getToken, hotelStatusUpdated]);

    useEffect(() => {
        if (location.pathname !== "/") {
            setIsScrolled(true);
            return;
        } else {
            setIsScrolled(false);
        }

        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [location.pathname]);

    return (
        <nav
            className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${isScrolled
                ? "bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4"
                : "py-4 md:py-6"
                }`}
        >
            {/* Logo */}
            <Link to="/">
                <img
                    src={assets.bookingIcon}
                    alt="logo"
                    className={`h-9 ${isScrolled && "invert opacity-80"}`}
                />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-4 lg:gap-8">
                {navLinks.map((link, i) => (
                    <Link
                        key={i}
                        to={link.path}
                        className={`group flex flex-col gap-0.5 ${isScrolled ? "text-gray-700" : "text-white"
                            }`}
                    >
                        {link.name}
                        <div
                            className={`${isScrolled ? "bg-gray-700" : "bg-white"
                                } h-0.5 w-0 group-hover:w-full transition-all duration-300`}
                        />
                    </Link>
                ))}

                {user && isAdmin && (
                    <button
                        className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer ${isScrolled ? "text-black" : "text-white"
                            } transition-all`}
                        onClick={() => navigate("/admin")}
                    >
                        Bảng quản trị
                    </button>
                )}
                {user && !isAdmin && (
                    <>
                        {isOwner ? (
                            <button
                                className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer ${isScrolled ? "text-black" : "text-white"
                                    } transition-all`}
                                onClick={() => navigate("/owner")}
                            >
                                Bảng điều khiển
                            </button>
                        ) : hotelStatus === 'pending' ? (
                            <button
                                onClick={() => setShowHotelReg(true)}
                                className={`flex items-center gap-2 px-4 py-1 text-sm font-medium rounded-full ${isScrolled ? "bg-yellow-100 text-yellow-800 border border-yellow-300" : "bg-yellow-200/90 text-yellow-900 border border-yellow-400"
                                    } transition-all hover:opacity-80 cursor-pointer`}>
                                <svg className="h-4 w-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>Đang chờ phê duyệt</span>
                            </button>
                        ) : hotelStatus === 'rejected' ? (
                            <button
                                className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer ${isScrolled ? "text-black border-red-300" : "text-white border-red-400"
                                    } transition-all hover:opacity-80`}
                                onClick={() => setShowHotelReg(true)}
                            >
                                Đăng ký lại khách sạn
                            </button>
                        ) : (
                            <button
                                className={`border px-4 py-1 text-sm font-light rounded-full cursor-pointer ${isScrolled ? "text-black" : "text-white"
                                    } transition-all`}
                                onClick={() => setShowHotelReg(true)}
                            >
                                Đăng ký khách sạn của bạn
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Desktop Right */}
            <div className="hidden md:flex items-center gap-4">
                <img
                    src={assets.searchIcon}
                    alt="search"
                    className={`${isScrolled && "invert"
                        } h-7 transition-all duration-500`}
                />

                {user ? (
                    <UserButton>
                        <UserButton.MenuItems>
                            <UserButton.Action
                                label="Danh sách phòng yêu thích"
                                labelIcon={<HeartIcon />}
                                onClick={() => navigate("/favorites")}
                            />
                            <UserButton.Action
                                label="Danh sách đặt phòng"
                                labelIcon={<BookIcon />}
                                onClick={() => navigate("/my-bookings")}
                            />
                        </UserButton.MenuItems>
                    </UserButton>
                ) : (
                    <button
                        onClick={openSignIn}
                        className={`px-8 py-2.5 rounded-full ml-4 transition-all duration-500 ${isScrolled
                            ? "text-white bg-black"
                            : "bg-white text-black"
                            }`}
                    >
                        Đăng nhập
                    </button>
                )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 md:hidden">
                {user && (
                    <UserButton>
                        <UserButton.MenuItems>
                            <UserButton.Action
                                label="Danh sách phòng yêu thích"
                                labelIcon={<HeartIcon />}
                                onClick={() => navigate("/favorites")}
                            />
                            <UserButton.Action
                                label="Lịch sử đặt phòng"
                                labelIcon={<BookIcon />}
                                onClick={() => navigate("/my-bookings")}
                            />
                        </UserButton.MenuItems>
                    </UserButton>
                )}
                <img
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    src={assets.menuIcon}
                    alt=""
                    className={`${isScrolled && "invert"} h-4 cursor-pointer`}
                />
            </div>

            {/* Mobile Menu */}
            <div
                className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <button
                    className="absolute top-4 right-4"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <img
                        src={assets.closeIcon}
                        alt="close-menu"
                        className="h-6"
                    />
                </button>

                {navLinks.map((link, i) => (
                    <Link
                        key={i}
                        to={link.path}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        {link.name}
                    </Link>
                ))}

                {user && isAdmin && (
                    <button
                        className="border px-4 py-1 text-sm font-light rounded-full cursor-pointer transition-all"
                        onClick={() => navigate("/admin")}
                    >
                        Bảng quản trị
                    </button>
                )}
                {user && !isAdmin && (
                    <>
                        {isOwner ? (
                            <button
                                className="border px-4 py-1 text-sm font-light rounded-full cursor-pointer transition-all"
                                onClick={() => navigate("/owner")}
                            >
                                Bảng điều khiển
                            </button>
                        ) : hotelStatus === 'pending' ? (
                            <button
                                onClick={() => setShowHotelReg(true)}
                                className="flex items-center gap-2 px-4 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300 transition-all hover:opacity-80 cursor-pointer"
                            >
                                <svg className="h-4 w-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>Đang chờ phê duyệt</span>
                            </button>
                        ) : hotelStatus === 'rejected' ? (
                            <button
                                className="border px-4 py-1 text-sm font-light rounded-full cursor-pointer transition-all border-red-300 text-red-700 hover:opacity-80"
                                onClick={() => setShowHotelReg(true)}
                            >
                                Đăng ký lại khách sạn
                            </button>
                        ) : (
                            <button
                                className="border px-4 py-1 text-sm font-light rounded-full cursor-pointer transition-all"
                                onClick={() => setShowHotelReg(true)}
                            >
                                Đăng ký khách sạn của bạn
                            </button>
                        )}
                    </>
                )}

                {!user && (
                    <button
                        onClick={openSignIn}
                        className="bg-black text-white px-8 py-2.5 rounded-full transition-all duration-500"
                    >
                        Đăng nhập
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
