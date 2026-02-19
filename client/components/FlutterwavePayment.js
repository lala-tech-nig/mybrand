'use client';

import React from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

export default function FlutterwavePayment({ amount, email, phone, name, title, description, onSuccess, onClose, className, children }) {
    const config = {
        public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: Date.now() + '_' + Math.floor(Math.random() * 1000000),
        amount: amount,
        currency: 'NGN',
        payment_options: 'card,mobilemoney,ussd',
        customer: {
            email: email,
            phone_number: phone,
            name: name,
        },
        customizations: {
            title: title || 'myBrand Payment',
            description: description || 'Payment for services',
            logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
        },
    };

    const handleFlutterwavePayment = useFlutterwave(config);

    return (
        <button
            className={className}
            onClick={() => {
                handleFlutterwavePayment({
                    callback: (response) => {
                        console.log("Payment response:", response);
                        closePaymentModal(); // this will close the modal programmatically
                        if (response.status === "successful") {
                            onSuccess(response);
                        }
                    },
                    onClose: () => {
                        if (onClose) onClose();
                    },
                });
            }}
        >
            {children || `Pay ₦${amount.toLocaleString()}`}
        </button>
    );
}
