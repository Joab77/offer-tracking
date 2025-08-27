import './bootstrap';
import './../css/app.css';
import React from 'react';
import App from './App';

import { createRoot } from 'react-dom/client';
import {AuthProvider} from "./contexts/AuthContext.jsx";
import {BrowserRouter} from "react-router-dom";


const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <BrowserRouter>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </BrowserRouter>
        </React.StrictMode>
    );
}
