import React, { useState, useEffect } from 'react';

const Footer = () => (
    <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-lg font-semibold">© 2025 Travel Experience. All rights reserved.</p>
        </div>
    </footer>
);

const About = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [hoveredStat, setHoveredStat] = useState(null);
    const [hoveredValue, setHoveredValue] = useState(null);
    const [hoveredMember, setHoveredMember] = useState(null);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const stats = [
        { number: '10,000+', label: 'Khách sạn đối tác' },
        { number: '500,000+', label: 'Khách hàng hài lòng' },
        { number: '100+', label: 'Thành phố' },
        { number: '4.8/5', label: 'Đánh giá trung bình' }
    ];

    const team = [
        { name: 'Nguyễn Văn A', role: 'CEO & Founder', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', description: 'Với hơn 15 năm kinh nghiệm trong ngành du lịch', color: 'from-blue-500 to-cyan-500' },
        { name: 'Trần Thị B', role: 'CTO', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', description: 'Chuyên gia công nghệ với tầm nhìn đổi mới', color: 'from-purple-500 to-pink-500' },
        { name: 'Lê Văn C', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', description: 'Đảm bảo trải nghiệm khách hàng hoàn hảo', color: 'from-green-500 to-teal-500' },
        { name: 'Phạm Thị D', role: 'Marketing Director', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', description: 'Kết nối thương hiệu với khách hàng', color: 'from-orange-500 to-red-500' }
    ];

    const values = [
        { icon: '🎯', title: 'Sứ mệnh', description: 'Mang đến trải nghiệm đặt phòng khách sạn dễ dàng, nhanh chóng và đáng tin cậy cho mọi người.', gradient: 'from-blue-500 to-cyan-500', bgGradient: 'from-blue-50 to-cyan-50' },
        { icon: '👁️', title: 'Tầm nhìn', description: 'Trở thành nền tảng đặt phòng hàng đầu Việt Nam, kết nối du khách với những trải nghiệm tuyệt vời.', gradient: 'from-purple-500 to-pink-500', bgGradient: 'from-purple-50 to-pink-50' },
        { icon: '💎', title: 'Giá trị cốt lõi', description: 'Uy tín, chất lượng, đổi mới và luôn đặt khách hàng làm trung tâm trong mọi quyết định.', gradient: 'from-green-500 to-emerald-500', bgGradient: 'from-green-50 to-emerald-50' },
        { icon: '🤝', title: 'Cam kết', description: 'Đảm bảo giá tốt nhất, dịch vụ chăm sóc khách hàng 24/7 và chính sách hoàn tiền linh hoạt.', gradient: 'from-orange-500 to-red-500', bgGradient: 'from-orange-50 to-red-50' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
            <style>{`
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-30px); } }
                @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); } 50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); } }
                @keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                @keyframes fade-in-up { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes bounce-in { 0% { transform: scale(0) rotate(-180deg); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes wiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(5deg); } 75% { transform: rotate(-5deg); } }
                @keyframes slide-left { from { transform: translateX(-100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes slide-right { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
                .animate-gradient { background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
                .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }
                .animate-wiggle { animation: wiggle 1s ease-in-out; }
                .animate-slide-left { animation: slide-left 0.8s ease-out; }
                .animate-slide-right { animation: slide-right 0.8s ease-out; }
            `}</style>

            {/* Floating Backgrounds */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
                <div className="absolute top-60 right-20 w-80 h-80 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
            </div>

            {/* Hero Section */}
            <div className="relative h-[75vh] overflow-hidden mt-16">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient"></div>
                <div className="absolute inset-0 bg-black/30"></div>
                
                {['🏨', '✈️', '🌍', '⭐'].map((icon, i) => (
                    <div key={i} className="absolute text-4xl animate-float opacity-30" style={{ left: `${15 + i * 20}%`, top: `${20 + i * 15}%`, animationDelay: `${i * 0.5}s` }}>{icon}</div>
                ))}

                <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600" alt="about" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40" />
                
                <div className={`relative z-10 h-full flex flex-col items-center justify-center text-white px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="text-6xl mb-6 animate-bounce-in">🏢</div>
                    <h1 className="text-6xl md:text-8xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white animate-gradient pb-2">Về chúng tôi</h1>
                    <div className="h-1.5 w-40 mx-auto bg-gradient-to-r from-transparent via-white to-transparent animate-pulse rounded-full mb-6"></div>
                    <p className="text-xl md:text-2xl text-blue-50 max-w-4xl text-center leading-relaxed">Chúng tôi là nền tảng đặt phòng khách sạn hàng đầu, kết nối du khách với hàng ngàn khách sạn chất lượng trên toàn quốc</p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-16 lg:px-24 xl:px-32 -mt-24 relative z-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className={`group relative bg-white rounded-3xl shadow-2xl p-8 text-center transition-all duration-500 cursor-pointer animate-bounce-in ${hoveredStat === i ? 'scale-110 z-10' : 'hover:scale-105'}`} style={{ animationDelay: `${i * 0.1}s` }} onMouseEnter={() => setHoveredStat(i)} onMouseLeave={() => setHoveredStat(null)}>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 rounded-3xl blur-xl -z-10 transition-opacity duration-500"></div>
                            <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">{stat.number}</div>
                            <div className="text-gray-600 font-bold group-hover:text-gray-900 transition-colors duration-300">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Story Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-16 lg:px-24 xl:px-32 py-24">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6 animate-slide-left">
                        <h2 className="text-5xl font-black text-gray-900">Hành trình <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">đổi mới</span></h2>
                        <p className="text-gray-600 text-lg leading-relaxed hover:text-gray-900 transition-colors">Được thành lập vào năm 2020, chúng tôi bắt đầu với một ý tưởng đơn giản: làm cho việc đặt phòng khách sạn trở nên dễ dàng và thuận tiện hơn bao giờ hết.</p>
                        <p className="text-gray-600 text-lg leading-relaxed hover:text-gray-900 transition-colors">Từ một startup nhỏ, chúng tôi đã phát triển thành một trong những nền tảng đặt phòng được tin dùng nhất tại Việt Nam.</p>
                    </div>
                    <div className="relative animate-slide-right">
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-75 blur-xl animate-gradient"></div>
                        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800" alt="team" className="relative rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-500" />
                        <div className="absolute -bottom-8 -left-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-3xl shadow-2xl hover:scale-110 transition-all duration-300 animate-float">
                            <div className="text-5xl font-black">5+</div>
                            <div className="text-sm font-semibold">Năm kinh nghiệm</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-16 lg:px-24 xl:px-32">
                    <div className="text-center mb-16 animate-fade-in-up">
                        <h2 className="text-5xl font-black text-gray-900 mb-6">Giá trị của <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">chúng tôi</span></h2>
                        <p className="text-gray-600 text-xl max-w-3xl mx-auto">Những giá trị cốt lõi định hướng mọi hoạt động và quyết định của chúng tôi</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, i) => (
                            <div key={i} className={`group relative bg-gradient-to-br ${value.bgGradient} rounded-3xl p-8 border-2 border-white transition-all duration-500 cursor-pointer animate-fade-in-up ${hoveredValue === i ? 'scale-105 z-10' : 'hover:scale-105'}`} style={{ animationDelay: `${i * 0.15}s` }} onMouseEnter={() => setHoveredValue(i)} onMouseLeave={() => setHoveredValue(null)}>
                                <div className={`absolute inset-0 bg-gradient-to-r ${value.gradient} opacity-0 group-hover:opacity-20 rounded-3xl blur-xl -z-10 transition-opacity duration-500`}></div>
                                <div className="text-6xl mb-4 group-hover:scale-125 group-hover:animate-wiggle transition-transform duration-300">{value.icon}</div>
                                <h3 className={`text-2xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r ${value.gradient}`}>{value.title}</h3>
                                <p className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-16 lg:px-24 xl:px-32 py-24">
                <div className="text-center mb-16 animate-fade-in-up">
                    <h2 className="text-5xl font-black text-gray-900 mb-6">Đội ngũ của <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">chúng tôi</span></h2>
                    <p className="text-gray-600 text-xl max-w-3xl mx-auto">Những con người tài năng và tận tâm đằng sau sự thành công của chúng tôi</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {team.map((member, i) => (
                        <div key={i} className={`group relative bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 cursor-pointer animate-fade-in-up ${hoveredMember === i ? 'scale-105 z-10' : 'hover:scale-105'}`} style={{ animationDelay: `${i * 0.15}s` }} onMouseEnter={() => setHoveredMember(i)} onMouseLeave={() => setHoveredMember(null)}>
                            <div className={`absolute inset-0 bg-gradient-to-r ${member.color} opacity-0 group-hover:opacity-100 blur-xl -z-10 transition-opacity duration-500`}></div>
                            <div className="relative h-80 overflow-hidden">
                                <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-125 group-hover:rotate-3 transition-all duration-700" />
                                <div className={`absolute inset-0 bg-gradient-to-t ${member.color} opacity-0 group-hover:opacity-60 transition-opacity duration-500`}></div>
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="text-xl font-black text-gray-900 mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all">{member.name}</h3>
                                <p className={`font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r ${member.color}`}>{member.role}</p>
                                <p className="text-gray-600 text-sm group-hover:text-gray-900 transition-colors">{member.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-24 overflow-hidden animate-gradient">
                <div className="absolute inset-0 opacity-20">{[...Array(30)].map((_, i) => <div key={i} className="absolute w-2 h-2 bg-white rounded-full animate-pulse" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }}></div>)}</div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-5xl font-black text-white mb-6 animate-fade-in-up">Sẵn sàng bắt đầu chuyến đi?</h2>
                    <p className="text-white text-xl mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>Khám phá hàng ngàn khách sạn chất lượng với giá tốt nhất</p>
                    <button className="group px-10 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-110 animate-bounce-in" style={{animationDelay: '0.4s'}}>
                        <span className="flex items-center gap-2">Đặt phòng ngay <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></span>
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default About;