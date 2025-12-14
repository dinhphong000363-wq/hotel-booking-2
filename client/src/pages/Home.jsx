import React from 'react'
import Hero from '../components/home/Hero'
import FeaturedDestination from '../components/home/FeaturedDestination'
import NewsLetter from '../components/home/NewsLetter'
import Footer from '../components/layout/Footer'
import RecommendedHotels from '../components/home/RecommendedHotels'
const Home = () => {
  return (
    <div>
      <Hero />
      <RecommendedHotels />
      <FeaturedDestination />
      <NewsLetter />
      <Footer />
    </div>
  )
}

export default Home