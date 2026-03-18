import React from 'react';
import MainLayout from './layouts/MainLayout';
import HeroSection from './components/sections/HeroSection';
import ProblemSection from './components/sections/ProblemSection';
import SolutionSection from './components/sections/SolutionSection';
import DemoSection from './components/demo/DemoSection';

function App() {
  return (
    <MainLayout>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <DemoSection />
    </MainLayout>
  );
}

export default App;
