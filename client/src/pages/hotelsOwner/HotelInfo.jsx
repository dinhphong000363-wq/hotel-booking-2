import { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { useAppContext } from '../../conext/AppContext'
import toast from 'react-hot-toast'
import axios from 'axios'

const HotelInfo = () => {
    const { axios: authAxios, getToken, user } = useAppContext()
    const [hotel, setHotel] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [contactError, setContactError] = useState("")

    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        provinceCode: '',
        provinceName: '',
        wardCode: '',
        wardName: '',
        addressDetail: '',
    })

    // API data
    const [provinces, setProvinces] = useState([])
    const [wards, setWards] = useState([])
    const [filteredWards, setFilteredWards] = useState([])
    const [wardSearch, setWardSearch] = useState("")
    const [loadingProvinces, setLoadingProvinces] = useState(false)
    const [loadingWards, setLoadingWards] = useState(false)

    // Fetch provinces
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                setLoadingProvinces(true)
                const response = await axios.get('https://provinces.open-api.vn/api/p/')
                setProvinces(response.data)
            } catch (error) {
                console.error('Error fetching provinces:', error)
            } finally {
                setLoadingProvinces(false)
            }
        }
        fetchProvinces()
    }, [])

    // Fetch wards when province changes
    useEffect(() => {
        const fetchWards = async () => {
            if (!formData.provinceCode || !isEditing) {
                setWards([])
                setFilteredWards([])
                return
            }

            try {
                setLoadingWards(true)
                const response = await axios.get(`https://provinces.open-api.vn/api/p/${formData.provinceCode}?depth=3`)
                const allWards = []
                if (response.data.districts) {
                    response.data.districts.forEach(district => {
                        if (district.wards) {
                            district.wards.forEach(ward => {
                                allWards.push({
                                    ...ward,
                                    districtName: district.name
                                })
                            })
                        }
                    })
                }
                setWards(allWards)
                setFilteredWards(allWards)
            } catch (error) {
                console.error('Error fetching wards:', error)
            } finally {
                setLoadingWards(false)
            }
        }
        fetchWards()
    }, [formData.provinceCode, isEditing])

    // Filter wards based on search
    useEffect(() => {
        if (!wardSearch.trim()) {
            setFilteredWards(wards)
            return
        }

        const searchLower = wardSearch.toLowerCase()
        const filtered = wards.filter(ward =>
            ward.name.toLowerCase().includes(searchLower) ||
            ward.districtName.toLowerCase().includes(searchLower)
        )
        setFilteredWards(filtered)
    }, [wardSearch, wards])

    // Validate phone number
    const validatePhoneNumber = (phone) => {
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')

        if (!/^\d{10,11}$/.test(cleanPhone)) {
            return "Số điện thoại phải có 10-11 chữ số"
        }

        const validPrefixes = ['03', '05', '07', '08', '09', '01']
        const prefix = cleanPhone.substring(0, 2)

        if (!validPrefixes.includes(prefix)) {
            return "Số điện thoại không hợp lệ"
        }

        return ""
    }

    const fetchHotelInfo = async () => {
        try {
            setLoading(true)
            const token = await getToken()
            const { data } = await authAxios.get('/api/hotels/owner', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                setHotel(data.hotel)
                // Parse address back to components if needed
                setFormData({
                    name: data.hotel.name || '',
                    contact: data.hotel.contact || '',
                    provinceName: data.hotel.city || '',
                    wardName: data.hotel.district || '',
                    addressDetail: data.hotel.street || data.hotel.houseNumber || '',
                    provinceCode: '',
                    wardCode: '',
                })
            } else {
                toast.error(data.message || 'Không thể tải thông tin khách sạn')
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchHotelInfo()
        }
    }, [user])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleContactChange = (e) => {
        let value = e.target.value

        // Only allow numbers
        value = value.replace(/[^\d]/g, '')

        // Limit to 11 digits
        if (value.length > 11) {
            value = value.slice(0, 11)
        }

        setFormData(prev => ({
            ...prev,
            contact: value
        }))

        if (value.trim()) {
            const error = validatePhoneNumber(value)
            setContactError(error)
        } else {
            setContactError("")
        }
    }

    const handleProvinceChange = (e) => {
        const selectedCode = e.target.value
        const selectedProvince = provinces.find(p => p.code.toString() === selectedCode)

        setFormData(prev => ({
            ...prev,
            provinceCode: selectedCode,
            provinceName: selectedProvince ? selectedProvince.name : "",
            wardCode: "",
            wardName: ""
        }))
        setWardSearch("")
        setWards([])
        setFilteredWards([])
    }

    const handleWardChange = (e) => {
        const selectedCode = e.target.value
        const selectedWard = wards.find(w => w.code.toString() === selectedCode)

        setFormData(prev => ({
            ...prev,
            wardCode: selectedCode,
            wardName: selectedWard ? selectedWard.name : ""
        }))
    }

    const handleSave = async () => {
        if (!formData.name || !formData.contact || !formData.provinceName || !formData.wardName || !formData.addressDetail) {
            toast.error('Vui lòng điền đầy đủ thông tin')
            return
        }

        // Validate phone before save
        const phoneError = validatePhoneNumber(formData.contact)
        if (phoneError) {
            setContactError(phoneError)
            toast.error(phoneError)
            return
        }

        setSaving(true)
        try {
            // Tạo địa chỉ đầy đủ
            const fullAddress = `${formData.addressDetail}, ${formData.wardName}, ${formData.provinceName}`

            const token = await getToken()
            const { data } = await authAxios.put('/api/hotels/owner', {
                name: formData.name,
                contact: formData.contact,
                address: fullAddress,
                city: formData.provinceName,
                district: formData.wardName,
                street: formData.addressDetail,
                houseNumber: '',
                fullAddress
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                toast.success('Cập nhật thông tin khách sạn thành công')
                setHotel(data.hotel)
                setIsEditing(false)
                await fetchHotelInfo()
            } else {
                toast.error(data.message || 'Không thể cập nhật thông tin')
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra')
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        if (hotel) {
            setFormData({
                name: hotel.name || '',
                contact: hotel.contact || '',
                provinceName: hotel.city || '',
                wardName: hotel.district || '',
                addressDetail: hotel.street || hotel.houseNumber || '',
                provinceCode: '',
                wardCode: '',
            })
        }
        setContactError("")
        setIsEditing(false)
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ duyệt' },
            approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt' },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã từ chối' },
        }
        const config = statusConfig[status] || statusConfig.pending
        return (
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        )
    }

    if (!hotel) {
        return (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                Khách sạn chưa được đăng ký
            </div>
        )
    }

    return (
        <div>
            <Title
                align="left"
                font="outfit"
                title="Thông tin khách sạn"
                subTitle="Quản lý và cập nhật thông tin khách sạn của bạn. Thông tin này sẽ hiển thị cho khách hàng khi họ tìm kiếm."
            />

            <div className="mt-8 bg-white rounded-lg shadow-md p-6 md:p-8">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">Thông tin cơ bản</h3>
                    <div className="flex items-center gap-3">
                        {getStatusBadge(hotel.status)}
                        {!isEditing && hotel.status === 'approved' && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Chỉnh sửa
                            </button>
                        )}
                    </div>
                </div>

                {hotel.status !== 'approved' && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                            {hotel.status === 'pending'
                                ? 'Khách sạn của bạn đang chờ admin duyệt. Sau khi được duyệt, bạn có thể chỉnh sửa thông tin.'
                                : 'Khách sạn của bạn đã bị từ chối. Vui lòng liên hệ admin để biết thêm chi tiết.'}
                        </p>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Tên khách sạn */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên khách sạn <span className="text-red-500">*</span>
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập tên khách sạn"
                            />
                        ) : (
                            <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{hotel.name}</p>
                        )}
                    </div>

                    {/* Số điện thoại */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số điện thoại liên hệ <span className="text-red-500">*</span>
                        </label>
                        {isEditing ? (
                            <>
                                <input
                                    type="tel"
                                    name="contact"
                                    value={formData.contact}
                                    onChange={handleContactChange}
                                    maxLength={11}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${contactError
                                        ? 'border-red-500 focus:ring-red-200'
                                        : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                    placeholder="Ví dụ: 0912345678"
                                />
                                {contactError && (
                                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {contactError}
                                    </p>
                                )}
                                {!contactError && formData.contact && (
                                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Số điện thoại hợp lệ
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{hotel.contact}</p>
                        )}
                    </div>

                    {/* Tỉnh/Thành phố */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tỉnh/Thành phố <span className="text-red-500">*</span>
                        </label>
                        {isEditing ? (
                            <select
                                name="provinceCode"
                                value={formData.provinceCode}
                                onChange={handleProvinceChange}
                                disabled={loadingProvinces}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">
                                    {loadingProvinces ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}
                                </option>
                                {provinces.map((province) => (
                                    <option key={province.code} value={province.code}>
                                        {province.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{hotel.city}</p>
                        )}
                    </div>

                    {/* Phường/Xã */}
                    {isEditing && formData.provinceCode && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phường/Xã <span className="text-red-500">*</span>
                            </label>

                            {/* Search input */}
                            {wards.length > 0 && (
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm phường/xã..."
                                    className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    value={wardSearch}
                                    onChange={(e) => setWardSearch(e.target.value)}
                                />
                            )}

                            <select
                                name="wardCode"
                                value={formData.wardCode}
                                onChange={handleWardChange}
                                disabled={loadingWards}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">
                                    {loadingWards ? 'Đang tải...' : 'Chọn phường/xã'}
                                </option>
                                {filteredWards.map((ward) => (
                                    <option key={ward.code} value={ward.code}>
                                        {ward.name} - {ward.districtName}
                                    </option>
                                ))}
                            </select>
                            {wardSearch && filteredWards.length === 0 && wards.length > 0 && (
                                <p className="text-sm text-red-500 mt-1">
                                    Không tìm thấy phường/xã phù hợp
                                </p>
                            )}
                        </div>
                    )}
                    {!isEditing && hotel.district && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phường/Xã
                            </label>
                            <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">{hotel.district}</p>
                        </div>
                    )}

                    {/* Số nhà, tên đường */}
                    {isEditing && formData.wardCode && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số nhà, tên đường <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="addressDetail"
                                value={formData.addressDetail}
                                onChange={handleInputChange}
                                placeholder="Ví dụ: 123 Nguyễn Huệ"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Nhập số nhà và tên đường của khách sạn
                            </p>
                        </div>
                    )}

                    {/* Địa chỉ đầy đủ (chỉ hiển thị khi không chỉnh sửa) */}
                    {!isEditing && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Địa chỉ đầy đủ
                            </label>
                            <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">
                                {hotel.fullAddress || hotel.address}
                            </p>
                        </div>
                    )}

                    {/* Thông tin bổ sung */}
                    <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Thông tin bổ sung</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-medium">Ngày đăng ký:</span>
                                <p className="mt-1">{new Date(hotel.createdAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div>
                                <span className="font-medium">Cập nhật lần cuối:</span>
                                <p className="mt-1">{new Date(hotel.updatedAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleSave}
                                disabled={saving || !!contactError}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                            >
                                Hủy
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default HotelInfo
