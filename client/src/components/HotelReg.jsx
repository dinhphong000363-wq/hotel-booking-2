import React, { useState } from 'react'
import { assets, cities } from '../assets/assets'
import { useAppContext } from '../conext/AppContext'
import toast from 'react-hot-toast';

const HotelReg = () => {
    const { setShowHotelReg,axios, getToken , setIsOwner, setHotelStatusUpdated } = useAppContext();

    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [contact, setContact] = useState("");
    const [city, setCity] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const onSubmitHandle = async(event)=>{
        try {
            event.preventDefault();
            setSubmitting(true);
            const {data} = await axios.post(`/api/hotels`, {name,address,contact,city},{headers:{Authorization:`Bearer ${await getToken()}`}})
            if(data.success){
                setSubmitted(true);
                toast.success(data.message)
                // Don't set isOwner yet - wait for admin approval
                // Don't close form immediately - show status message
                // Trigger Navbar refresh to show pending status
                setHotelStatusUpdated(prev => prev + 1);
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi đăng ký khách sạn')
        } finally {
            setSubmitting(false);
        }
    }

    const handleClose = () => {
        setShowHotelReg(false);
        setSubmitted(false);
        setName("");
        setAddress("");
        setContact("");
        setCity("");
    }

    return (
        <div onClick={handleClose} className="fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center justify-center bg-black/70">
            <form onSubmit={onSubmitHandle} onClick={(e)=>e.stopPropagation()} className="flex bg-white rounded-xl max-w-4xl max-md:mx-2">
                <img
                    src={assets.regImage}
                    alt="reg-image"
                    className="w-1/2 rounded-xl hidden md:block"
                />

                <div className="relative flex flex-col items-center md:w-1/2 p-8 md:p-10">
                    <img
                        src={assets.closeIcon}
                        alt="close-icon"
                        className="absolute top-4 right-4 h-4 w-4 cursor-pointer"
                        onClick={handleClose}
                    />
                    
                    {!submitted ? (
                        <>
                            <p className="text-2xl font-semibold mt-6">
                                Đăng ký khách sạn của bạn
                            </p>
                    {/* Hotel name */}
                    <div className="w-full mt-4">
                        <label htmlFor="name" className="font-medium text-gray-500">Tên khách sạn</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Nhập thông tin"
                            className="border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light"
                            onChange={(e)=>setName(e.target.value)}
                            value={name}
                            required
                        />
                    </div>
                    <div className="w-full mt-4">
                        <label htmlFor="contact" className="font-medium text-gray-500">Số điện thoại</label>
                        <input
                            id="contact"
                            type="text"
                            placeholder="Nhập thông tin"
                            className="border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light"
                             onChange={(e)=>setContact(e.target.value)}
                            value={contact}
                            required
                        />
                    </div>
                    {/* adress */}
                    <div className="w-full mt-4">
                        <label htmlFor="adress" className="font-medium text-gray-500">Địa chỉ</label>
                        <input
                            id="adress"
                            type="text"
                            placeholder="Nhập thông tin"
                            className="border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light"
                             onChange={(e)=>setAddress(e.target.value)}
                            value={address}
                            required
                        />
                    </div>
                    {/* city */}
                    <div className="w-full mt-4 max-w-60 mr-auto">
                        <label htmlFor="city" className="font-medium text-gray-500">Thành phố</label>
                        <select
                            id="city"
                            className="border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light"
                             onChange={(e)=>setCity(e.target.value)}
                            value={city}
                            required
                        >
                            <option value="">Chọn thành phố</option>
                            {cities.map((city) => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        type="submit"
                        disabled={submitting}
                        className='bg-indigo-500 hover:bg-indigo-600 transition-all text-white mr-auto px-6 py-2 rounded cursor-pointer mt-6 disabled:opacity-50 disabled:cursor-not-allowed'>
                        {submitting ? 'Đang xử lý...' : 'Đăng ký'}
                    </button>
                        </>
                    ) : (
                        <>
                            {/* Success Message */}
                            <div className="w-full mt-6">
                                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                                    <div className="mb-4">
                                        <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-green-800 mb-2">
                                        Đăng ký thành công!
                                    </h3>
                                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mt-4">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <span className="text-lg font-bold text-yellow-800">Đang chờ duyệt</span>
                                        </div>
                                        <p className="text-sm text-yellow-700 mb-2">
                                            Khách sạn <span className="font-semibold">"{name}"</span> của bạn đã được gửi yêu cầu đăng ký thành công.
                                        </p>
                                        <p className="text-sm text-yellow-700">
                                            Vui lòng chờ admin xem xét và duyệt. Bạn sẽ nhận được thông báo khi có kết quả.
                                        </p>
                                    </div>
                                    <div className="mt-6 space-y-2 text-sm text-gray-600">
                                        <p className="font-medium">Thông tin đã đăng ký:</p>
                                        <div className="bg-white rounded-lg p-3 text-left space-y-1">
                                            <p><span className="font-semibold">Tên khách sạn:</span> {name}</p>
                                            <p><span className="font-semibold">Địa chỉ:</span> {address}</p>
                                            <p><span className="font-semibold">Thành phố:</span> {city}</p>
                                            <p><span className="font-semibold">Số điện thoại:</span> {contact}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className='bg-indigo-500 hover:bg-indigo-600 transition-all text-white px-6 py-2 rounded cursor-pointer mt-6'>
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </form>
        </div>

    )
}

export default HotelReg