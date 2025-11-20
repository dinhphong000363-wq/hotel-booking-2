import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
const Loader = () => {
    const navigate = useNavigate()
    const { nextUrl } = useParams()

    useEffect(() => {
        if (nextUrl) {
            // Giảm thời gian chờ xuống 2 giây
            setTimeout(() => {
                navigate(`/${nextUrl}`, { replace: true })
            }, 2000)
        }
    }, [nextUrl, navigate])
    return (
        <div className='flex justify-center items-center h-screen'>
            <div className='animate-spin rounded-full h-24 w-24 border-4
            border-gray-300 border-t-primary'></div>
        </div>
    )
}

export default Loader