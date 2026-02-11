"use client";

import React from 'react';
import Link from 'next/link';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[var(--muted)]">
            <Card className="w-full max-w-md bg-white">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Sign in to myBrand</CardTitle>
                    <p className="text-sm text-zinc-500 mt-2">
                        Enter your email to access your brand dashboard
                    </p>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">Email address</label>
                            <Input id="email" type="email" placeholder="you@example.com" required />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
                            <Input id="password" type="password" placeholder="••••••••" required />
                        </div>
                        <Button className="w-full" type="submit">Sign In</Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <span className="text-zinc-500">Don't have a brand yet? </span>
                        <Link href="/register" className="font-medium text-[var(--primary)] hover:underline">
                            Create one for free
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
