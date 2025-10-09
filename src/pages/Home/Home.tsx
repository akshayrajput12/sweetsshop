import React from 'react';
import CuratedGiftingHero from './components/CuratedGiftingHero';
import CategoriesCarousel from './components/CategoriesCarousel';
import BestSellers from './components/BestSellers';
import NewArrivals from './components/NewArrivals';
import SpecialOffers from './components/SpecialOffers';
import InstagramCarousel from './components/InstagramCarousel';
import Testimonials from '@/components/ui/testimonials';

const Home = () => {
  return (
   <main className="min-h-screen">
  <CuratedGiftingHero />
  <div className="space-y-4">
    <CategoriesCarousel />   {/* let users explore sweet categories early */}
    <BestSellers />          {/* showcase our most popular sweets */}
    <NewArrivals />          {/* highlight fresh and exciting treats */}
    <SpecialOffers />        {/* sweet deals and discounts */}
    <Testimonials />         {/* build trust with customer reviews */}
    <InstagramCarousel />    {/* showcase our sweet lifestyle */}
  </div>
</main>

  );
};

export default Home;