import { useEffect, useState } from 'react';
import ContactForm from './ContactForm';
import { getFormData } from '@/utils/formStorage';
import { Card } from '@/components/ui/card';
const BookingWidget = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [calendarLoaded, setCalendarLoaded] = useState(false);
  useEffect(() => {
    // Load user data from localStorage
    const storedData = getFormData();
    if (storedData) {
      const userName = storedData.name || `${storedData.firstName || ''} ${storedData.lastName || ''}`.trim();
      setUserData({
        name: userName,
        email: storedData.email || '',
        phone: storedData.phone || '',
        company: storedData.company || ''
      });
      console.log('Retrieved form data for booking widget:', storedData);
    }

    // Create a script element for the form embed
    const script = document.createElement('script');
    script.src = "https://team.growthagency.com.br/js/form_embed.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => setCalendarLoaded(true);

    // Add the script to the document
    document.body.appendChild(script);

    // Clean up function to remove the script when component unmounts
    return () => {
      const existingScript = document.querySelector('script[src="https://team.growthagency.com.br/js/form_embed.js"]');
      if (existingScript && document.body.contains(existingScript)) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  // Monitor any changes to the calendar
  useEffect(() => {
    if (calendarLoaded) {
      console.log("Calendar loaded and ready with user data:", userData);
    }
  }, [calendarLoaded, userData]);

  // Build query parameters for the iframe URL
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (userData.email) params.append('email', userData.email);
    if (userData.name) params.append('name', userData.name);
    if (userData.phone) params.append('phone', userData.phone);
    if (userData.company) params.append('company', userData.company);
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-xl">
        <div className="bg-zinc-900/50 backdrop-blur-3xl rounded-[2.5rem] p-10 md:p-14 border border-white/10 shadow-2xl shadow-revgreen/5 hover:border-white/20 transition-all duration-700">
          <div className="mb-12 text-center">
            <h3 className="text-3xl font-black text-white tracking-tighter mb-4">
              Agende um <span className="text-revgreen">Diagnóstico.</span>
            </h3>
            <p className="text-zinc-400 text-sm font-normal tracking-tight">
              Fale com um Engenheiro de Receita e descubra seu potencial real.
            </p>
          </div>
          <ContactForm variant="dark" formType="diagnosis" />
        </div>
      </div>
    </div>
  );
};
export default BookingWidget;