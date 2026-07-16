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
      <div className="w-full max-w-lg">
        <Card className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200 hover:shadow-xl transition-all">
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Entre em <span className="text-revgreen">contato</span>
          </h3>
          <ContactForm />
        </Card>
      </div>
    </div>
  );
};
export default BookingWidget;