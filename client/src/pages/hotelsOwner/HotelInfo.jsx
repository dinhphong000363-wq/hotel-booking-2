import { useEffect, useState } from 'react'
import Title from '../../components/common/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import axios from 'axios'

// Field component - moved outside to prevent re-creation on each render
const Field = ({ label, value, name, type = "text", placeholder, required, editing, error, onChange }) => {
    return (
        <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-1">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{label}</span>
                {required && <span className="text-red-500">*</span>}
            </label>
            {editing ? (
                <div className="relative">
                    <input
                        type={type}
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        maxLength={name === 'contact' ? 11 : undefined}
                        className={`w-full px-4 py-3 border-2 rounded-xl font-medium transition-all duration-200 focus:ring-4 focus:outline-none ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100 bg-white hover:border-gray-300'
                            }`}
                        placeholder={placeholder}
                    />
                    {error && (
                        <div className="flex items-center gap-1.5 mt-2 text-sm text-red-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}
                    {!error && name === 'contact' && value && (
                        <div className="flex items-center gap-1.5 mt-2 text-sm text-emerald-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>Số điện thoại hợp lệ</span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl text-gray-800 font-medium border border-gray-100 shadow-sm">
                    {value || 'Chưa có thông tin'}
                </div>
            )}
        </div>
    )
}

const HotelInfo = () => {
    const { axios: authAxios, getToken, user, setHotelStatusUpdated, fetchRooms } = useAppContext()
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

    const [provinces, setProvinces] = useState([])
    const [wards, setWards] = useState([])
    const [filteredWards, setFilteredWards] = useState([])
    const [wardSearch, setWardSearch] = useState("")
    const [loadingProvinces, setLoadingProvinces] = useState(false)
    const [loadingWards, setLoadingWards] = useState(false)

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
        value = value.replace(/[^\d]/g, '')
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

        const phoneError = validatePhoneNumber(formData.contact)
        if (phoneError) {
            setContactError(phoneError)
            toast.error(phoneError)
            return
        }

        setSaving(true)
        try {
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
                // Trigger refresh for other components
                setHotelStatusUpdated(prev => prev + 1)
                // Refresh rooms data to update hotel info in all rooms
                await fetchRooms()
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
            pending: {
                bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
                text: 'text-amber-700',
                border: 'border-amber-200',
                icon: '⏳',
                label: 'Chờ duyệt'
            },
            approved: {
                bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
                text: 'text-emerald-700',
                border: 'border-emerald-200',
                icon: '✓',
                label: 'Đã duyệt'
            },
            rejected: {
                bg: 'bg-gradient-to-r from-rose-50 to-red-50',
                text: 'text-rose-700',
                border: 'border-rose-200',
                icon: '✕',
                label: 'Đã từ chối'
            },
        }
        const config = statusConfig[status] || statusConfig.pending
        return (
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-full border-2 ${config.bg} ${config.text} ${config.border} shadow-sm`}>
                <span>{config.icon}</span>
                {config.label}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                    <p className="text-gray-600 font-medium">Đang tải thông tin...</p>
                </div>
            </div>
        )
    }

    if (!hotel) {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 text-center border border-blue-100">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có thông tin khách sạn</h3>
                <p className="text-gray-600">Khách sạn của bạn chưa được đăng ký trong hệ thống</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <Title
                align="left"
                font="outfit"
                title="Thông tin khách sạn"
                subTitle="Quản lý và cập nhật thông tin khách sạn của bạn. Thông tin này sẽ hiển thị cho khách hàng khi họ tìm kiếm."
            />

            <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100 backdrop-blur-sm">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b-2 border-gradient-to-r from-blue-100 to-indigo-100">
                    <div className="mb-4 md:mb-0">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Thông tin cơ bản
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Quản lý chi tiết thông tin khách sạn</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {getStatusBadge(hotel.status)}
                        {!isEditing && hotel.status === 'approved' && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="group px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Chỉnh sửa
                            </button>
                        )}
                    </div>
                </div>

                {/* Alert Banner */}
                {hotel.status !== 'approved' && (
                    <div className={`mb-8 p-5 rounded-xl border-2 ${hotel.status === 'pending'
                        ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
                        : 'bg-gradient-to-r from-rose-50 to-red-50 border-rose-200'
                        }`}>
                        <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${hotel.status === 'pending' ? 'bg-amber-200' : 'bg-rose-200'
                                }`}>
                                {hotel.status === 'pending' ? (
                                    <svg className="w-5 h-5 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-rose-700" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className={`font-bold mb-1 ${hotel.status === 'pending' ? 'text-amber-800' : 'text-rose-800'}`}>
                                    {hotel.status === 'pending' ? 'Đang chờ xét duyệt' : 'Yêu cầu đã bị từ chối'}
                                </h4>
                                <p className={`text-sm ${hotel.status === 'pending' ? 'text-amber-700' : 'text-rose-700'}`}>
                                    {hotel.status === 'pending'
                                        ? 'Khách sạn của bạn đang chờ admin duyệt. Sau khi được duyệt, bạn có thể chỉnh sửa thông tin.'
                                        : 'Khách sạn của bạn đã bị từ chối. Vui lòng liên hệ admin để biết thêm chi tiết.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Fields */}
                <div className="space-y-7">
                    <Field
                        label="Tên khách sạn"
                        value={isEditing ? formData.name : hotel.name}
                        name="name"
                        placeholder="Nhập tên khách sạn"
                        required
                        editing={isEditing}
                        onChange={handleInputChange}
                    />

                    <Field
                        label="Số điện thoại liên hệ"
                        value={isEditing ? formData.contact : hotel.contact}
                        name="contact"
                        type="tel"
                        placeholder="Ví dụ: 0912345678"
                        required
                        editing={isEditing}
                        error={contactError}
                        onChange={handleContactChange}
                    />

                    {/* Province Selector */}
                    <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-1">
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Tỉnh/Thành phố</span>
                            <span className="text-red-500">*</span>
                        </label>
                        {isEditing ? (
                            <>
                                <select
                                    name="provinceCode"
                                    value={formData.provinceCode}
                                    onChange={handleProvinceChange}
                                    disabled={loadingProvinces}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-medium transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none bg-white hover:border-gray-300"
                                >
                                    <option value="">Chọn tỉnh/thành phố</option>
                                    {provinces.map(province => (
                                        <option key={province.code} value={province.code}>
                                            {province.name}
                                        </option>
                                    ))}
                                </select>
                            </>
                        ) : (
                            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl text-gray-800 font-medium border border-gray-100 shadow-sm">
                                {formData.provinceName}
                            </div>
                        )}
                    </div>

                    {/* Ward Selector */}
                    {isEditing && formData.provinceCode && (
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-1">
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Phường/Xã</span>
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={wardSearch}
                                onChange={(e) => setWardSearch(e.target.value)}
                                placeholder="Tìm kiếm phường/xã..."
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-medium transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none bg-white hover:border-gray-300 mb-2"
                            />
                            <select
                                name="wardCode"
                                value={formData.wardCode}
                                onChange={handleWardChange}
                                disabled={loadingWards}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-medium transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none bg-white hover:border-gray-300"
                            >
                                <option value="">Chọn phường/xã</option>
                                {filteredWards.map(ward => (
                                    <option key={ward.code} value={ward.code}>
                                        {ward.name} - {ward.districtName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Address Detail */}
                    <Field
                        label="Số nhà, tên đường"
                        value={isEditing ? formData.addressDetail : hotel.street || hotel.houseNumber}
                        name="addressDetail"
                        placeholder="Ví dụ: 123 Nguyễn Huệ"
                        required
                        editing={isEditing}
                        onChange={handleInputChange}
                    />

                    {/* Full Address Display */}
                    {!isEditing && (
                        <div className="group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Địa chỉ đầy đủ</span>
                            </label>
                            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl text-gray-800 font-medium border border-gray-100 shadow-sm flex items-start gap-2">
                                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{hotel.fullAddress || hotel.address}</span>
                            </div>
                        </div>
                    )}

                    {/* Additional Info Section */}
                    <div className="pt-6 border-t-2 border-gray-100">
                        <h4 className="text-base font-bold text-gray-800 mb-5 flex items-center gap-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                            Thông tin bổ sung
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Ngày đăng ký</span>
                                        <p className="text-sm font-bold text-gray-800 mt-0.5">{new Date(hotel.createdAt).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Cập nhật lần cuối</span>
                                        <p className="text-sm font-bold text-gray-800 mt-0.5">{new Date(hotel.updatedAt).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t-2 border-gray-100">
                            <button
                                onClick={handleSave}
                                disabled={saving || !!contactError}
                                className="flex-1 group px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Đang lưu...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Lưu thay đổi</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-bold border-2 border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Hủy</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default HotelInfo