import { useRef, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

interface PlacesAutocompleteProps {
    onAddressSelect: (address: {
        street: string;
        city: string;
        state: string;
        country: string;
        zip: string;
        formatted: string;
    }) => void;
    onChange?: (value: string) => void;
    placeholder?: string;
    apiKey: string;
    className?: string;
    defaultValue?: string;
}

declare global {
    interface Window {
        google: any;
        initGooglePlaces?: () => void;
    }
}

const PlacesAutocomplete = ({ onAddressSelect, onChange, placeholder = "Digite o endereço da empresa...", apiKey, className, defaultValue }: PlacesAutocompleteProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [inputValue, setInputValue] = useState(defaultValue || '');

    useEffect(() => {
        // Load Google Maps Script if not present
        if (!window.google?.maps?.places) {
            const scriptId = 'google-maps-places-script';
            if (!document.getElementById(scriptId)) {
                const script = document.createElement('script');
                script.id = scriptId;
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`;
                script.async = true;
                script.defer = true;
                window.initGooglePlaces = () => setScriptLoaded(true);
                document.head.appendChild(script);
            } else {
                // Script already loading/loaded, just wait for callback or check availability
                const checkGoogle = setInterval(() => {
                    if (window.google?.maps?.places) {
                        setScriptLoaded(true);
                        clearInterval(checkGoogle);
                    }
                }, 500);
            }
        } else {
            setScriptLoaded(true);
        }
    }, [apiKey]);

    useEffect(() => {
        if (!scriptLoaded || !inputRef.current) return;

        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ['establishment', 'geocode'],
            fields: ['address_components', 'formatted_address']
        });

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();

            // Allow manual entry if no place details returned (user pressed enter without selecting)
            if (!place.address_components) {
                if (onChange) onChange(inputRef.current?.value || '');
                return;
            }

            let street = '';
            let number = '';
            let city = '';
            let state = '';
            let country = '';
            let zip = '';

            place.address_components.forEach((component: any) => {
                const types = component.types;
                if (types.includes('route')) street = component.long_name;
                if (types.includes('street_number')) number = component.long_name;
                if (types.includes('administrative_area_level_2') || types.includes('locality')) city = component.long_name;
                if (types.includes('administrative_area_level_1')) state = component.short_name;
                if (types.includes('country')) country = component.long_name;
                if (types.includes('postal_code')) zip = component.long_name;
            });

            const formattedAddress = place.formatted_address || '';
            const companyName = formattedAddress.split(',')[0]; // Simple heuristic

            onAddressSelect({
                street: `${street}, ${number}`,
                city,
                state,
                country,
                zip,
                formatted: formattedAddress
            });

            setInputValue(formattedAddress);
            if (onChange) onChange(formattedAddress); // Also trigger change
        });
    }, [scriptLoaded, onAddressSelect, onChange]);

    return (
        <div className="relative w-full">
            <Input
                ref={inputRef}
                className={`pl-10 ${className}`}
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    if (onChange) onChange(e.target.value);
                }}
            />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        </div>
    );
};

export default PlacesAutocomplete;
