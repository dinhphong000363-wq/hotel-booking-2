import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
const Loader = () => {
    const navigate = useNavigate()
    const { nextUrl } = useParams()

    useEffect(() => {
        if (nextUrl) {
            // Tăng thời gian chờ lên 4 giây để webhook kịp xử lý
            // Stripe webhook thường mất 2-3 giây để xử lý
            setTimeout(() => {
                navigate(`/${nextUrl}`, { replace: true })
            }, 4000)
        }
    }, [nextUrl, navigate])
    return (
        <div className='flex flex-col justify-center items-center h-screen gap-4'>
            <div className='animate-spin rounded-full h-24 w-24 border-4
            border-gray-300 border-t-primary'></div>
            <p className='text-gray-600 text-lg'>Đang xử lý thanh toán...</p>
            <p className='text-gray-500 text-sm'>Vui lòng đợi trong giây lát</p>
        </div>
    )
}

export default Loader