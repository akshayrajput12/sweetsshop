import React from 'react';
import HeroBanner from './components/HeroBanner';
import BestSellers from './components/BestSellers';
import CategoriesCarousel from './components/CategoriesCarousel';
import WhyChooseUs from './components/WhyChooseUs';

const Home = () => {
  return (
    <main>
      <HeroBanner />
      <BestSellers />
      <CategoriesCarousel />
      <WhyChooseUs />
    </main>
  );
};

export default Home;