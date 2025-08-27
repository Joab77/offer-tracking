import { useState, useEffect } from 'react';
import axios from 'axios';


export const useLocation = () => {
    const [location, setLocation] = useState({
        loading: true,
        error: null,
        latitude: null,
        longitude: null,
        code: null,
        country: null,
        city: null,
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocation(prev => ({
                ...prev,
                loading: false,
                error: 'Géolocalisation non supportée',
            }));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    console.log("latitude", latitude)
                    console.log("longitude", longitude)
                    const response = await axios.get(
                        `api/location?lat=${latitude}&lng=${longitude}`
                    );

                    const result = response.data.results[0]?.components;

                    console.log("herer", response)

                    setLocation({
                        loading: false,
                        error: null,
                        latitude,
                        longitude,
                        code: result?.country_code?.toUpperCase() || null,
                        country: result?.country || null,
                        city: result?.city || result?.town || result?.village || null,
                    });
                } catch (err) {
                    setLocation(prev => ({
                        ...prev,
                        loading: false,
                        error: 'Impossible de récupérer le pays',
                    }));
                }
            },
            (err) => {
                setLocation(prev => ({
                    ...prev,
                    loading: false,
                    error: err.message,
                }));
            }
        );
    }, []);

    return location;
};
