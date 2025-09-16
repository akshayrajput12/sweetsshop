import React from 'react';
import HeroBanner from './components/HeroBanner';
import CategoriesCarousel from './components/CategoriesCarousel';
import BestSellers from './components/BestSellers';
import NewArrivals from './components/NewArrivals';
import SpecialOffers from './components/SpecialOffers';
import InstagramCarousel from './components/InstagramCarousel';
import Testimonials from '@/components/ui/testimonials';

const Home = () => {
  return (
   <main className="min-h-screen">
  <HeroBanner />
  <div className="space-y-4">
    <CategoriesCarousel />   {/* let users explore by category early */}
    <BestSellers />          {/* show proven, popular products next */}
    <NewArrivals />          {/* highlight freshness and excitement */}
    <SpecialOffers />        {/* discounts/deals to drive conversions */}
    <Testimonials />         {/* build trust before social content */}
    <InstagramCarousel />    {/* lifestyle/social proof at the end */}
  </div>
</main>

  );
};

export default Home;