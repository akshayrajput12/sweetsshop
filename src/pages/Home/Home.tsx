import React from 'react';
import CuratedGiftingHero from './components/CuratedGiftingHero';
import CategoriesCarousel from './components/CategoriesCarousel';
import BestSellers from './components/BestSellers';
import NewArrivals from './components/NewArrivals';
import SpecialOffers from './components/SpecialOffers';
import InstagramCarousel from './components/InstagramCarousel';
import Testimonials from '@/components/ui/testimonials';
import PromotionalBanner from './components/PromotionalBanner';
import MithaiSpecials from './components/MithaiSpecials';
import FestivalSpecials from './components/FestivalSpecials';

const Home = () => {
  return (
    <main className="min-h-screen">
      <CuratedGiftingHero />
      <div className="flex flex-col">
        <CategoriesCarousel />   {/* Light */}
        <BestSellers />          {/* Darker */}

        <PromotionalBanner />    {/* Full width image */}

        <NewArrivals />          {/* Light */}
        <MithaiSpecials />       {/* Darker */}
        <FestivalSpecials />     {/* Light */}

        <SpecialOffers />        {/* Should check this one's bg */}
        <Testimonials />         {/* Should check bg */}
        <InstagramCarousel />    {/* Should check bg */}
      </div>
    </main>
  );
};

export default Home;