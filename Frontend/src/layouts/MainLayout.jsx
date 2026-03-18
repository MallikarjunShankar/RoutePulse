import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-[#00CFFF]/30 overflow-x-hidden pt-20">
      <Navbar />
      
      <main className="flex-1 w-full">
        {children}
      </main>

      <Footer />
      
      {/* Global decorative background elements */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden mix-blend-screen">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#00CFFF]/20 blur-[150px] rounded-full opacity-50" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#c084fc]/10 blur-[150px] rounded-full opacity-50" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CgkJPGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIC8+Cgk8L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      </div>
    </div>
  );
};

export default MainLayout;
