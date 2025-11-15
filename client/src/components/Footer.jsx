import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
    return (
        <footer className="bg-white text-gray-600 pt-12 px-6 md:px-16 lg:px-24 xl:px-32 border-t border-gray-200">
            {/* Footer content */}
            <div className="flex flex-wrap justify-between gap-12 md:gap-8">
                {/* Logo + Intro */}
                <div className="max-w-80">
                    <img
                        src={assets.bookingIcon || '/src/assets/logo.png'}
                        alt="logo"
                        className="mb-4 h-9 object-contain"
                    />
                    <p className="text-sm leading-relaxed">
                        Khám phá thế giới cùng những khách sạn sang trọng và những trải nghiệm khó quên.
                        Chúng tôi kết nối bạn với điểm đến trong mơ.
                    </p>
                    {/* Socials */}
                    <div className="flex items-center gap-4 mt-4 text-gray-500">
                        <img src={assets.instagramIcon} alt="instagram" className="h-6 w-6 hover:opacity-70 transition" />
                        <svg className="w-6 h-6 hover:text-black transition" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M13.5 9H15V6.5h-1.5c-1.933 0-3.5 1.567-3.5 3.5v1.5H8v3h2.5V21h3v-7.5H16l.5-3h-3z" />
                        </svg>
                        <svg className="w-6 h-6 hover:text-black transition" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22 5.92a8.2 8.2 0 01-2.36.65A4.1 4.1 0 0021.4 4a8.27 8.27 0 01-2.6 1A4.14 4.14 0 0016 4a4.15 4.15 0 00-4.15 4.15c0 .32.04.64.1.94a11.75 11.75 0 01-8.52-4.32 4.14 4.14 0 001.29 5.54A4.1 4.1 0 013 10v.05a4.15 4.15 0 003.33 4.07 4.12 4.12 0 01-1.87.07 4.16 4.16 0 003.88 2.89A8.33 8.33 0 012 19.56a11.72 11.72 0 006.29 1.84c7.55 0 11.68-6.25 11.68-11.67 0-.18 0-.35-.01-.53A8.18 8.18 0 0022 5.92z" />
                        </svg>
                        <svg className="w-6 h-6 hover:text-black transition" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.98 3.5C3.88 3.5 3 4.38 3 5.48c0 1.1.88 1.98 1.98 1.98h.02c1.1 0 1.98-.88 1.98-1.98C6.98 4.38 6.1 3.5 4.98 3.5zM3 8.75h3.96V21H3V8.75zm6.25 0h3.8v1.68h.05c.53-.98 1.82-2.02 3.75-2.02 4.01 0 4.75 2.64 4.75 6.07V21H17v-5.63c0-1.34-.03-3.07-1.88-3.07-1.88 0-2.17 1.47-2.17 2.98V21H9.25V8.75z" />
                        </svg>
                    </div>
                </div>

                {/* Links */}
                <div>
                    <p className="text-lg font-semibold text-gray-800">CÔNG TY</p>
                    <ul className="mt-3 flex flex-col gap-2 text-sm">
                        <li><a href="#" className="hover:text-black transition">Về chúng tôi</a></li>
                        <li><a href="#" className="hover:text-black transition">Tuyển dụng</a></li>
                        <li><a href="#" className="hover:text-black transition">Tin tức</a></li>
                        <li><a href="#" className="hover:text-black transition">Blog</a></li>
                        <li><a href="#" className="hover:text-black transition">Đối tác</a></li>
                    </ul>
                </div>

                <div>
                    <p className="text-lg font-semibold text-gray-800">HỖ TRỢ</p>
                    <ul className="mt-3 flex flex-col gap-2 text-sm">
                        <li><a href="#" className="hover:text-black transition">Trung tâm trợ giúp</a></li>
                        <li><a href="#" className="hover:text-black transition">Chính sách an toàn</a></li>
                        <li><a href="#" className="hover:text-black transition">Tùy chọn hủy</a></li>
                        <li><a href="#" className="hover:text-black transition">Liên hệ</a></li>
                        <li><a href="#" className="hover:text-black transition">Truy cập dễ dàng</a></li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div className="max-w-80">
                    <p className="text-lg font-semibold text-gray-800">ĐĂNG KÝ NHẬN TIN</p>
                    <p className="mt-3 text-sm">
                        Nhận thông tin ưu đãi và cảm hứng du lịch mỗi tuần.
                    </p>
                    <div className="flex items-center mt-4">
                        <input
                            type="email"
                            className="bg-white rounded-l-md border border-gray-300 h-9 px-3 outline-none text-sm w-full"
                            placeholder="Nhập email của bạn"
                        />
                        <button className="flex items-center justify-center bg-black h-9 px-3 rounded-r-md hover:bg-gray-800 transition">
                            <svg
                                className="w-4 h-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m14 0-4 4m4-4-4-4" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom line */}
            <hr className="border-gray-200 mt-12" />
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between py-6 text-sm">
                <p>© {new Date().getFullYear()} <a href="#" className="hover:text-black">Stayy</a>. Bảo lưu mọi quyền.</p>
                <ul className="flex items-center gap-4">
                    <li><a href="#" className="hover:text-black transition">Chính sách bảo mật</a></li>
                    <li><a href="#" className="hover:text-black transition">Điều khoản</a></li>
                    <li><a href="#" className="hover:text-black transition">Sơ đồ trang</a></li>
                </ul>
            </div>
        </footer>
    )
}

export default Footer
