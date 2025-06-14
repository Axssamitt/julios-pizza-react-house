
import React from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { AboutUs } from '@/components/AboutUs';
import { PizzaGallery } from '@/components/PizzaGallery';
import { ContactForm } from '@/components/ContactForm';
import { InstagramFeed } from '@/components/InstagramFeed';
import { Footer } from '@/components/Footer';
import { useAnalytics } from '@/hooks/useAnalytics';

const Index = () => {
  // Rastrear acesso à página principal
  useAnalytics('/');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main>
        <Hero />
        <PizzaGallery />
        <InstagramFeed />
        <ContactForm />
        <AboutUs />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
