'use client';

import React from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { CreditCard, CheckCircle } from 'lucide-react';

export default function PaymentModal({ brand, amount, planName, onIsSuccessful }) {
    const config = {
        public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-SANDBOX', // Use env or sandbox fallback
        tx_ref: Date.now(),
        amount: amount,
        currency: 'NGN',
        payment_options: 'card,mobilemoney,ussd',
        customer: {
            email: brand.email,
            phone_number: brand.whatsappNumber,
            name: brand.fullName || brand.brandName,
        },
        customizations: {
            title: `myBrand ${planName} Plan`,
            description: `Payment for ${planName} Subscription`,
            logo: brand.logoUrl || 'https://st2.depositphotos.com/4035913/6124/i/450/depositphotos_61243733-stock-photo-business-company-logo.jpg',
        },
    };

    const handleFlutterPayment = useFlutterwave(config);

    return (
        <button
            onClick={() => {
                handleFlutterPayment({
                    callback: (response) => {
                        console.log(response);
                        if (response.status === 'successful') {
                            closePaymentModal(); // this will close the modal programmatically
                            onIsSuccessful();
                        }
                    },
                    onClose: () => { },
                });
            }}
            className="w-full bg-[#FF6600] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#e65c00] transition-transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
        >
            <CreditCard size={20} />
            Pay ₦{amount.toLocaleString()} Now
        </button>
    );
}
