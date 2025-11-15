import React, { useState } from "react";
import { assets, cities, heroSliderImages } from "../assets/assets";
import { useAppContext } from "../conext/AppContext";

const Hero = () => {
  const { navigate, getToken, axios, setSearchedCities } = useAppContext();
  const [destination, setDestination] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const totalSlides = heroSliderImages.length;

  const goToSlide = (index) => {
    if (totalSlides === 0) return;
    const nextIndex = (index + totalSlides) % totalSlides;
    setCurrentSlide(nextIndex);
  };

  const goToNext = () => {
    goToSlide(currentSlide + 1);
  };

  const goToPrev = () => {
    goToSlide(currentSlide - 1);
  };

  React.useEffect(() => {
    if (totalSlides === 0) return undefined;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 2000);

    return () => clearInterval(interval);
  }, [totalSlides]);

  const onSearch = async (e) => {
    e.preventDefault();
    navigate(`/rooms?destination=${destination}`);

    await axios.post(
      "/api/user/store-recent-search",
      { recentSearchedCity: destination },
      { headers: { Authorization: `Bearer ${await getToken()}` } }
    );

    setSearchedCities((prev) => {
      const updated = [...prev, destination];
      if (updated.length > 3) updated.shift();
      return updated;
    });
  };

  return (
    <div
      className='relative flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white h-screen'
      style={{
        backgroundImage:
          totalSlides > 0 ? `url(${heroSliderImages[currentSlide]})` : `url(${assets.heroImage || ""})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background-image 0.8s ease-in-out",
      }}
    >
      {/* Overlay để tăng tương phản */}
      <div className='absolute inset-0 bg-black/40'></div>

      {/* Slider Controls */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrev}
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/40 text-white rounded-full p-2 transition-all"
            aria-label="Ảnh trước"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/40 text-white rounded-full p-2 transition-all"
            aria-label="Ảnh tiếp theo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </>
      )}

      <div className='relative z-10 max-w-2xl'>
        <p className='bg-[#49B9FF]/60 px-4 py-1 rounded-full inline-block text-sm'>
          Trải nghiệm khách sạn tuyệt đỉnh
        </p>

        <h1 className='font-playfair text-4xl md:text-6xl font-extrabold mt-4 leading-tight'>
          Khám phá điểm đến lý tưởng của bạn
        </h1>

        <p className='mt-3 text-sm md:text-base text-gray-100'>
          Sự sang trọng và tiện nghi tuyệt vời đang chờ đón bạn tại những khách sạn và khu nghỉ dưỡng độc quyền nhất thế giới.
          Hãy bắt đầu hành trình của bạn ngay hôm nay.
        </p>
      </div>

      {/* Form tìm kiếm */}
      <form
        onSubmit={onSearch}
        className='relative z-10 bg-white text-gray-700 rounded-2xl shadow-lg px-6 py-4 mt-10 flex flex-col md:flex-row items-center gap-4 w-full max-w-4xl'
      >
        {/* Destination */}
        <div className='flex flex-col flex-1 min-w-[150px]'>
          <label htmlFor='destinationInput' className='text-sm font-medium mb-1 flex items-center gap-2'>
            <img src={assets.locationIcon} alt='' className='h-4' />
            Điểm đến
          </label>
          <input
            onChange={(e) => setDestination(e.target.value)}
            value={destination}
            list='destinations'
            id='destinationInput'
            type='text'
            className='border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black/30'
            placeholder='Nhập điểm đến'
            required
          />
        </div>
        <datalist id='destinations'>
          {cities.map((city, index) => (
            <option value={city} key={index} />
          ))}
        </datalist>

        {/* Check-in */}
        <div className='flex flex-col'>
          <label htmlFor='checkIn' className='text-sm font-medium mb-1 flex items-center gap-2'>
            <img src={assets.calenderIcon} alt='' className='h-4' />
            Nhận phòng
          </label>
          <input
            id='checkIn'
            type='date'
            className='border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black/30'
          />
        </div>

        {/* Check-out */}
        <div className='flex flex-col'>
          <label htmlFor='checkOut' className='text-sm font-medium mb-1 flex items-center gap-2'>
            <img src={assets.calenderIcon} alt='' className='h-4' />
            Trả phòng
          </label>
          <input
            id='checkOut'
            type='date'
            className='border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black/30'
          />
        </div>

        {/* Guests */}
        <div className='flex flex-col'>
          <label htmlFor='guests' className='text-sm font-medium mb-1'>
            Số khách
          </label>
          <input
            min={1}
            max={4}
            id='guests'
            type='number'
            className='border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black/30 w-20 text-center'
            placeholder='0'
          />
        </div>

        {/* Search button */}
        <button
          type='submit'
          className='flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl 
          hover:bg-gray-800 transition-all w-full md:w-auto'
        >
          <img src={assets.searchIcon} alt='searchIcon' className='h-5' />
          <span>Tìm kiếm</span>
        </button>
      </form>
    </div>
  );
};

export default Hero;
