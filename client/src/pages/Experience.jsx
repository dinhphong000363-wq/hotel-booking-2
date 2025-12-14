import React, { useState, useEffect } from 'react';

// Mock Footer component
const Footer = () => (
    <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-lg font-semibold">© 2025 Travel Experience. All rights reserved.</p>
        </div>
    </footer>
);

const Experience = () => {
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const [isVisible, setIsVisible] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const experiences = [
        {
            id: 1,
            title: 'Khám phá ẩm thực địa phương',
            description: 'Trải nghiệm hương vị đặc trưng của từng vùng miền với các món ăn truyền thống được chế biến bởi đầu bếp địa phương.',
            image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
            category: 'Ẩm thực',
            duration: '2-3 giờ',
            price: 'Từ $25',
            rating: 4.8,
            reviews: 234
        },
        {
            id: 2,
            title: 'Tour tham quan văn hóa',
            description: 'Khám phá di sản văn hóa, lịch sử và kiến trúc độc đáo với hướng dẫn viên chuyên nghiệp.',
            image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
            category: 'Văn hóa',
            duration: '4-5 giờ',
            price: 'Từ $35',
            rating: 4.9,
            reviews: 456
        },
        {
            id: 3,
            title: 'Thư giãn tại Spa',
            description: 'Tận hưởng các liệu pháp massage và chăm sóc sức khỏe truyền thống để thư giãn hoàn toàn.',
            image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
            category: 'Thư giãn',
            duration: '1-2 giờ',
            price: 'Từ $40',
            rating: 4.7,
            reviews: 189
        },
        {
            id: 4,
            title: 'Phiêu lưu mạo hiểm',
            description: 'Trải nghiệm các hoạt động ngoài trời như leo núi, lặn biển, dù lượn và nhiều hơn nữa.',
            image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
            category: 'Mạo hiểm',
            duration: 'Cả ngày',
            price: 'Từ $60',
            rating: 4.9,
            reviews: 312
        },
        {
            id: 5,
            title: 'Chụp ảnh chuyên nghiệp',
            description: 'Lưu giữ kỷ niệm đẹp với dịch vụ chụp ảnh chuyên nghiệp tại các địa điểm nổi tiếng.',
            image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800',
            category: 'Nhiếp ảnh',
            duration: '2-3 giờ',
            price: 'Từ $50',
            rating: 4.8,
            reviews: 167
        },
        {
            id: 6,
            title: 'Tham quan thiên nhiên',
            description: 'Khám phá vẻ đẹp thiên nhiên hoang sơ với các tour trekking và cắm trại.',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            category: 'Thiên nhiên',
            duration: '1-2 ngày',
            price: 'Từ $80',
            rating: 4.9,
            reviews: 278
        }
    ];

    const categories = ['Tất cả', 'Ẩm thực', 'Văn hóa', 'Thư giãn', 'Mạo hiểm', 'Nhiếp ảnh', 'Thiên nhiên'];

    const filteredExperiences = selectedCategory === 'Tất cả'
        ? experiences
        : experiences.filter(exp => exp.category === selectedCategory);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes shimmer {
                    0% { background-position: -1000px 0; }
                    100% { background-position: 1000px 0; }
                }
                @keyframes bounce-in {
                    0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
                    50% { transform: scale(1.05) rotate(2deg); }
                    100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }
                @keyframes slide-up {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
                .animate-gradient { 
                    background-size: 200% 200%;
                    animation: gradient-shift 8s ease infinite;
                }
                .animate-shimmer {
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
                    background-size: 2000px 100%;
                    animation: shimmer 3s infinite;
                }
                .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
                .animate-slide-up { animation: slide-up 0.8s ease-out; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* Floating Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
                <div className="absolute top-40 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
                <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
            </div>

            {/* Hero Section */}
            <div className="relative h-[70vh] overflow-hidden mt-16">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient"></div>
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* Animated Particles */}
                <div className="absolute inset-0">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-white rounded-full animate-pulse-slow"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                opacity: Math.random() * 0.5 + 0.3
                            }}
                        ></div>
                    ))}
                </div>

                <img
                    src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600"
                    alt="experiences"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
                />
                
                <div className={`relative z-10 h-full flex flex-col items-center justify-center text-white px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="text-center space-y-6">
                        <h1 className="text-6xl md:text-7xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white animate-gradient pb-2">
                            Trải nghiệm độc đáo
                        </h1>
                        <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
                        <p className="text-xl md:text-2xl text-blue-50 max-w-3xl mb-8 leading-relaxed">
                            Khám phá những hoạt động thú vị và tạo nên những kỷ niệm khó quên trong chuyến đi của bạn
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button className="group relative px-8 py-4 bg-white text-blue-600 rounded-full font-bold hover:scale-110 transition-all duration-300 shadow-2xl overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                                    Đặt phòng ngay
                                </span>
                                <div className="absolute inset-0 animate-shimmer"></div>
                            </button>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-8 animate-bounce">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className={`max-w-7xl mx-auto px-4 md:px-16 lg:px-24 xl:px-32 py-12 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {categories.map((category, index) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-8 py-3 rounded-full font-bold whitespace-nowrap transition-all duration-300 transform hover:scale-110 animate-bounce-in ${
                                selectedCategory === category
                                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl scale-110'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-400 shadow-lg'
                            }`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Experiences Grid */}
            <div className="max-w-7xl mx-auto px-4 md:px-16 lg:px-24 xl:px-32 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredExperiences.map((experience, index) => (
                        <div
                            key={experience.id}
                            className={`group relative bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-blue-500/50 animate-slide-up ${
                                hoveredCard === experience.id ? 'scale-105 z-10' : 'hover:scale-105'
                            }`}
                            style={{ animationDelay: `${index * 0.15}s` }}
                            onMouseEnter={() => setHoveredCard(experience.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            {/* Glowing Border Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"></div>
                            
                            <div className="relative h-72 overflow-hidden">
                                <img
                                    src={experience.image}
                                    alt={experience.title}
                                    className="w-full h-full object-cover group-hover:scale-125 group-hover:rotate-3 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                
                                {/* Category Badge */}
                                <div className="absolute top-4 right-4 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-md opacity-70"></div>
                                        <div className="relative bg-white px-4 py-2 rounded-full text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl">
                                            {experience.category}
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl transform scale-0 group-hover:scale-100 transition-transform duration-500">
                                        <svg className="w-16 h-16 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <h3 className="text-2xl font-black text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                                    {experience.title}
                                </h3>
                                
                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                                    {experience.description}
                                </p>

                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full group-hover:bg-blue-100 transition-colors duration-300">
                                        <svg className="w-4 h-4 text-blue-600 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-semibold">{experience.duration}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-full group-hover:bg-yellow-100 transition-colors duration-300">
                                        <svg className="w-4 h-4 text-yellow-500 fill-current group-hover:scale-125 transition-transform duration-300" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="font-semibold">{experience.rating}</span>
                                        <span className="text-gray-500">({experience.reviews})</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <span className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 inline-block">
                                        {experience.price}
                                    </span>
                                    <button className="relative px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-full font-bold transition-all duration-300 overflow-hidden group-hover:shadow-2xl group-hover:shadow-blue-500/50">
                                        <span className="relative z-10 flex items-center gap-2">
                                            Đặt ngay
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                    </button>
                                </div>
                            </div>

                            {/* Corner Accent */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Experience;