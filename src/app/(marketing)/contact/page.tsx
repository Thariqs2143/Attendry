
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="w-full py-24 md:py-32 lg:py-40">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Get in Touch</h1>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            We'd love to hear from you. Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
                        </p>
                    </div>
                </div>

                <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                    <div className="space-y-8">
                         <h2 className="text-2xl font-bold tracking-tighter">Contact Information</h2>
                         <p className="text-muted-foreground">
                            Find us at our office or drop us a line via email or phone.
                         </p>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-md bg-muted">
                                    <MapPin className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Our Office</h3>
                                    <p className="text-muted-foreground">123 Business Rd, Commerce City, 12345</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-4">
                                <div className="p-3 rounded-md bg-muted">
                                    <Mail className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Email Us</h3>
                                    <a href="mailto:support@attendry.com" className="text-muted-foreground hover:underline">support@attendry.com</a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-md bg-muted">
                                    <Phone className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Call Us</h3>
                                    <p className="text-muted-foreground">+91 12345 67890</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold tracking-tighter">Send us a Message</h2>
                         <p className="text-muted-foreground">
                            Fill out the form and we'll get back to you.
                         </p>
                        <form className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" placeholder="Enter your name" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="Enter your email" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" placeholder="What's your message about?" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" placeholder="Your message..." className="min-h-[120px]" />
                            </div>
                            <Button type="submit" className="w-full">Send Message</Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
