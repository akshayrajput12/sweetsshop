import React from 'react';
import HeroBanner from './components/HeroBanner';
import CategoriesCarousel from './components/CategoriesCarousel';
import BestSellers from './components/BestSellers';
import NewArrivals from './components/NewArrivals';
import SpecialOffers from './components/SpecialOffers';
import WhyChooseUs from './components/WhyChooseUs';

const Home = () => {
  return (
    <main className="min-h-screen">
      <HeroBanner />
      <div className="space-y-4">
        <CategoriesCarousel />
        <BestSellers />
        <NewArrivals />
        <SpecialOffers />
        <WhyChooseUs />
      </div>
    </main>
  );
};

export default Home;