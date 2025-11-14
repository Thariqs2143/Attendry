
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone } from 'lucide-react';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 448 512" {...props}>
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-65.7-10.8-94-31.5l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
);


export default function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSendEmail = () => {
        const mailtoLink = `mailto:attendrys@gmail.com?subject=${encodeURIComponent(`Enquiry: ${subject}`)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
        window.location.href = mailtoLink;
    };
    
    const handleSendWhatsApp = () => {
        const whatsappMessage = `*Enquiry from Attendry Website*\n\n*Name:* ${name}\n*Email:* ${email}\n*Subject:* ${subject}\n\n*Message:*\n${message}`;
        const whatsappLink = `https://wa.me/919363200237?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappLink, '_blank');
    };


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
                            Drop us a line via Email, WhatsApp or Phone.
                         </p>
                        <div className="space-y-6">
                             <div className="flex items-start gap-4">
                                <div className="p-3 rounded-md bg-muted">
                                    <WhatsAppIcon className="h-6 w-6 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">WhatsApp Support</h3>
                                    <a href="https://wa.me/919363200237" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:underline">+91 93632 00237</a>
                                </div>
                            </div>
                             <div className="flex items-start gap-4">
                                <div className="p-3 rounded-md bg-muted">
                                    <Mail className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Email Us</h3>
                                    <a href="mailto:attendrys@gmail.com" className="text-muted-foreground hover:underline">attendrys@gmail.com</a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-md bg-muted">
                                    <Phone className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Call Us</h3>
                                    <p className="text-muted-foreground">+91 93632 00237</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold tracking-tighter">Send us a Message</h2>
                         <p className="text-muted-foreground">
                            Fill out the form and choose how you'd like to send it.
                         </p>
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" placeholder="What's your message about?" value={subject} onChange={(e) => setSubject(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" placeholder="Your message..." className="min-h-[120px]" value={message} onChange={(e) => setMessage(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <Button type="button" onClick={handleSendEmail} className="w-full">
                                    <Mail className="mr-2 h-4 w-4"/>
                                    Send via Email
                                </Button>
                                <Button type="button" onClick={handleSendWhatsApp} className="w-full bg-green-600 hover:bg-green-700 text-white">
                                    <WhatsAppIcon className="mr-2 h-4 w-4"/>
                                    Send on WhatsApp
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
