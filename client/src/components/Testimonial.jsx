import React from 'react'
import Title from './Title'

const Testimonial = () => {
    return (
        <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 pt-20 pb-30">
            <Title
                title="What Our Guests Say"
                subTitle="Discover why discerning travelers consistently choose QuickStay for their exclusive and luxurious accommodations around the world."
            />

            <div className="flex md:flex-row flex-col gap-5 mt-10">
                {/* Card 1 */}
                <div className="w-80 flex flex-col items-center border border-gray-300 p-10 rounded-lg bg-white shadow-sm hover:shadow-md transition-all">
                    <img
                        className="h-20 w-20 rounded-full"
                        src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200"
                        alt="userImage1"
                    />
                    <h2 className="text-lg text-gray-900 font-medium mt-2">Donald Jackman</h2>
                    <p className="text-sm text-gray-500">Graphic Designer</p>

                    {/* Stars */}
                    <div className="flex items-center justify-center mt-3 gap-1 text-orange-500">
                        {Array(5).fill(0).map((_, i) => (
                            <svg key={i} width="16" height="15" viewBox="0 0 16 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.524.464a.5.5 0 0 1 .952 0l1.432 4.41a.5.5 0 0 0 .476.345h4.637a.5.5 0 0 1 .294.904L11.563 8.85a.5.5 0 0 0-.181.559l1.433 4.41a.5.5 0 0 1-.77.559L8.294 11.65a.5.5 0 0 0-.588 0l-3.751 2.726a.5.5 0 0 1-.77-.56l1.433-4.41a.5.5 0 0 0-.181-.558L.685 6.123A.5.5 0 0 1 .98 5.22h4.637a.5.5 0 0 0 .476-.346z" />
                            </svg>
                        ))}
                    </div>

                    <p className="text-center text-[15px] mt-3 text-gray-500">
                        I've been using imagify for nearly two years, primarily for Instagram, and it has been incredibly user-friendly, making my work much easier.
                    </p>
                </div>

                {/* Card 2 */}
                <div className="w-80 flex flex-col items-center border border-gray-300 p-10 rounded-lg bg-white shadow-sm hover:shadow-md transition-all">
                    <img
                        className="h-20 w-20 rounded-full"
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
                        alt="userImage2"
                    />
                    <h2 className="text-lg text-gray-900 font-medium mt-2">Richard Nelson</h2>
                    <p className="text-sm text-gray-500">Content Creator</p>

                    <div className="flex items-center justify-center mt-3 gap-1 text-orange-500">
                        {Array(5).fill(0).map((_, i) => (
                            <svg key={i} width="16" height="15" viewBox="0 0 16 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.524.464a.5.5 0 0 1 .952 0l1.432 4.41a.5.5 0 0 0 .476.345h4.637a.5.5 0 0 1 .294.904L11.563 8.85a.5.5 0 0 0-.181.559l1.433 4.41a.5.5 0 0 1-.77.559L8.294 11.65a.5.5 0 0 0-.588 0l-3.751 2.726a.5.5 0 0 1-.77-.56l1.433-4.41a.5.5 0 0 0-.181-.558L.685 6.123A.5.5 0 0 1 .98 5.22h4.637a.5.5 0 0 0 .476-.346z" />
                            </svg>
                        ))}
                    </div>

                    <p className="text-center text-[15px] mt-3 text-gray-500">
                        I've been using imagify for nearly two years, primarily for Instagram, and it has been incredibly user-friendly, making my work much easier.
                    </p>
                </div>

                {/* Card 3 */}
                <div className="w-80 flex flex-col items-center border border-gray-300 p-10 rounded-lg bg-white shadow-sm hover:shadow-md transition-all">
                    <img
                        className="h-20 w-20 rounded-full"
                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop"
                        alt="userImage3"
                    />
                    <h2 className="text-lg text-gray-900 font-medium mt-2">James Washington</h2>
                    <p className="text-sm text-gray-500">Co-founder</p>

                    <div className="flex items-center justify-center mt-3 gap-1 text-orange-500">
                        {Array(5).fill(0).map((_, i) => (
                            <svg key={i} width="16" height="15" viewBox="0 0 16 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.524.464a.5.5 0 0 1 .952 0l1.432 4.41a.5.5 0 0 0 .476.345h4.637a.5.5 0 0 1 .294.904L11.563 8.85a.5.5 0 0 0-.181.559l1.433 4.41a.5.5 0 0 1-.77.559L8.294 11.65a.5.5 0 0 0-.588 0l-3.751 2.726a.5.5 0 0 1-.77-.56l1.433-4.41a.5.5 0 0 0-.181-.558L.685 6.123A.5.5 0 0 1 .98 5.22h4.637a.5.5 0 0 0 .476-.346z" />
                            </svg>
                        ))}
                    </div>

                    <p className="text-center text-[15px] mt-3 text-gray-500">
                        I've been using imagify for nearly two years, primarily for Instagram, and it has been incredibly user-friendly, making my work much easier.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Testimonial
