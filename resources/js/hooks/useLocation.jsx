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

        getLocation()
        async function getLocation (){
            try {
                const response = await axios.get(
                    `api/location`
                );

                const result = response.data.location;

                setLocation({
                    loading: false,
                    error: null,
                    code: result?.country_code?.toUpperCase() || null,
                    country: result?.country || null,
                    city: result?.city || null,
                });
            } catch (err) {
                setLocation(prev => ({
                    ...prev,
                    loading: false,
                    error: 'Impossible de récupérer le pays',
                }));
            }
        }
    }, []);

    return location;
};
