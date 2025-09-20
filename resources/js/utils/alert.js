// utils/alert.js
import Swal from 'sweetalert2';

const Alert = {
    success: (message, title = 'Succès') => {
        return Swal.fire({
            position: "top-end",
            icon: 'success',
            title,
            text: message,
            showConfirmButton: false,
            timer: 1500
        });
    },

    error: (message, title = 'Erreur') => {
        return Swal.fire({
            position: "top-end",
            icon: 'error',
            title,
            text: message,
            timer: 1500,
            showConfirmButton: false,
        });
    },

    warning: (message, title = 'Attention') => {
        return Swal.fire({
            icon: 'warning',
            title,
            text: message,
            confirmButtonColor: '#f1c40f',
        });
    },

    info: (message, title = 'Info') => {
        return Swal.fire({
            icon: 'info',
            title,
            text: message,
            confirmButtonColor: '#3085d6',
        });
    },

    confirm: (message, title = 'Êtes-vous sûr ?') => {
        return Swal.fire({
            icon: 'question',
            title,
            text: message,
            showCancelButton: true,
            confirmButtonText: 'Oui',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
        });
    }
};

export default Alert;
