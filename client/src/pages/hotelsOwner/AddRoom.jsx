import React, { useState } from 'react'
import Title from '../../components/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../conext/AppContext'
import toast from 'react-hot-toast'

const AddRoom = () => {
    const { axios, getToken } = useAppContext();

    const [images, setImages] = useState({
        1: null,
        2: null,
        3: null,
        4: null,
    });

    const [inputs, setInputs] = useState({
        roomType: '',
        pricePerNight: '',
        amenities: {
            'Free WiFi': false,
            'Free Breakfast': false,
            'Room Service': false,
            'Mountain View': false,
            'Pool Access': false,
        },
    });

    const [loading, setLoading] = useState(false);

    const onSubmitHandle = async (event) => {
        event.preventDefault();

        if (
            !inputs.roomType ||
            !inputs.pricePerNight ||
            !Object.values(images).some((image) => image)
        ) {
            toast.error('Please fill in all the details');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('roomType', inputs.roomType);
            formData.append('pricePerNight', inputs.pricePerNight);

            const amenities = Object.keys(inputs.amenities || {}).filter(
                (key) => inputs.amenities[key]
            );
            formData.append('amenities', JSON.stringify(amenities));

            // Add images
            Object.keys(images).forEach((key) => {
                if (images[key]) {
                    formData.append('images', images[key]);
                }
            });

            const token = await getToken();
            const { data } = await axios.post('/api/rooms', formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (data.success) {
                toast.success(data.message);
                setInputs({
                    roomType: '',
                    pricePerNight: '',
                    amenities: {
                        'WiFi miễn phí': false,
                        'Bữa sáng miễn phí': false,
                        'Dịch vụ phòng': false,
                        'Tầm nhìn ra núi': false,
                        'Lối vào hồ bơi': false,
                    },
                });
                setImages({ 1: null, 2: null, 3: null, 4: null });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={onSubmitHandle}
            className="bg-white shadow-xl rounded-2xl p-6 md:p-10 border border-gray-100"
        >
            {/* Tiêu đề */}
            <Title
                align="left"
                font="outfit"
                title="Thêm Phòng"
                subTitle="Điền thông tin chi tiết để khách hàng có trải nghiệm đặt phòng tốt nhất."
            />

            {/* Khu vực upload ảnh */}
            <div className="mt-10">
                <p className="text-gray-800 font-medium mb-2">Ảnh phòng</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Object.keys(images || {}).map((key) => (
                        <label
                            htmlFor={`roomImage${key}`}
                            key={key}
                            className="relative group cursor-pointer"
                        >
                            <img
                                src={
                                    images[key]
                                        ? URL.createObjectURL(images[key])
                                        : assets.uploadArea
                                }
                                alt={`room-upload-${key}`}
                                className="w-full h-32 object-cover rounded-xl border-2 border-dashed border-gray-300 hover:border-primary transition-all duration-200 group-hover:scale-[1.03]"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                id={`roomImage${key}`}
                                hidden
                                onChange={(e) =>
                                    setImages({ ...images, [key]: e.target.files[0] })
                                }
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center text-white text-sm transition-all">
                                Chọn ảnh
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Loại phòng và giá */}
            <div className="grid sm:grid-cols-2 gap-6 mt-10">
                <div>
                    <label className="text-gray-800 font-medium">Loại phòng</label>
                    <select
                        value={inputs.roomType}
                        onChange={(e) =>
                            setInputs({ ...inputs, roomType: e.target.value })
                        }
                        className="border border-gray-300 mt-2 rounded-lg p-3 w-full text-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                    >
                        <option value="">-- Chọn loại phòng --</option>
                        <option value="Single Bed">Single Bed</option>
                        <option value="Double Bed">Double Bed</option>
                        <option value="Luxury Room">Luxury Room</option>
                        <option value="Family Suite">Family Suite</option>
                    </select>
                </div>

                <div>
                    <label className="text-gray-800 font-medium">
                        Giá <span className="text-xs text-gray-500">/ đêm</span>
                    </label>
                    <input
                        type="number"
                        placeholder="0"
                        className="border border-gray-300 mt-2 rounded-lg p-3 w-full text-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all"
                        value={inputs.pricePerNight}
                        onChange={(e) =>
                            setInputs({ ...inputs, pricePerNight: e.target.value })
                        }
                    />
                </div>
            </div>

            {/* Tiện nghi */}
            <div className="mt-10">
                <p className="text-gray-800 font-medium mb-3">Tiện nghi</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-gray-600">
                    {Object.keys(inputs.amenities || {}).map((amenity, index) => (
                        <label
                            key={index}
                            className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
                        >
                            <input
                                type="checkbox"
                                checked={inputs.amenities?.[amenity] || false}
                                onChange={() =>
                                    setInputs({
                                        ...inputs,
                                        amenities: {
                                            ...inputs.amenities,
                                            [amenity]: !inputs.amenities[amenity],
                                        },
                                    })
                                }
                                className="accent-primary w-4 h-4"
                            />
                            <span className="capitalize">{amenity}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Nút Submit */}
            <button
                type="submit"
                className="mt-10 w-full sm:w-auto px-10 py-3 bg-primary text-white rounded-lg shadow-md hover:shadow-lg transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
                disabled={loading}
            >
                {loading ? 'Đang thêm...' : 'Thêm Phòng'}
            </button>
        </form>
    )
}

export default AddRoom