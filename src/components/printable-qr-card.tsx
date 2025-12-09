
'use client';

import { forwardRef } from 'react';
import Image from 'next/image';
import { ScanLine } from 'lucide-react';

type PrintableQrCardProps = {
  shopName: string;
  qrUrl: string;
  logoSrc: string;
};

export const PrintableQrCard = forwardRef<HTMLDivElement, PrintableQrCardProps>(
  ({ shopName, qrUrl, logoSrc }, ref) => {
    return (
      <div ref={ref} className="w-[400px] h-[600px] bg-white flex flex-col font-sans">
        {/* Top decorative element */}
        <div className="relative h-[100px] w-full">
          <div
            className="absolute -top-10 -left-10 w-[200px] h-[150px] bg-sky-500 origin-bottom-left"
            style={{ transform: 'rotate(-45deg)', opacity: 0.8 }}
          />
          <div
            className="absolute -top-10 -left-0 w-[200px] h-[150px] bg-blue-600 origin-bottom-left"
            style={{ transform: 'rotate(-30deg)', opacity: 0.9 }}
          />
           <div
            className="absolute -top-10 right-0 w-[200px] h-[150px] bg-indigo-500 origin-bottom-right"
            style={{ transform: 'rotate(25deg)', opacity: 0.7 }}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-between text-center px-8">
            {/* Logo */}
            <div className="w-48 h-16 relative">
              <Image src={logoSrc} alt="Attendry Logo" layout="fill" objectFit="contain" />
            </div>

            {/* QR Code */}
            <div className="p-2 border-4 border-blue-600 rounded-2xl bg-white shadow-lg my-4">
              {qrUrl ? (
                <Image
                  src={qrUrl}
                  alt={`QR Code for ${shopName}`}
                  width={220}
                  height={220}
                  className="rounded-lg"
                />
              ) : (
                <div className="w-[220px] h-[220px] bg-gray-200 flex items-center justify-center rounded-lg">
                    <p className="text-sm text-gray-500">QR Code</p>
                </div>
              )}
            </div>

            {/* Call to Action */}
            <div className="w-full">
                <div className="bg-blue-600 text-white font-bold text-3xl py-3 px-6 rounded-lg shadow-md">
                    SCAN TO CHECK-IN
                </div>
                <p className="mt-4 text-lg font-medium text-gray-600">
                    Employees: Use your phone camera to scan.
                </p>
            </div>
        </div>

         {/* Bottom decorative element */}
        <div className="relative h-[100px] w-full overflow-hidden">
          <div
            className="absolute -bottom-16 -right-12 w-[250px] h-[180px] bg-sky-500 origin-top-right"
            style={{ transform: 'rotate(-55deg)', opacity: 0.8 }}
          />
          <div
            className="absolute -bottom-16 -right-0 w-[250px] h-[180px] bg-blue-600 origin-top-right"
            style={{ transform: 'rotate(-40deg)', opacity: 0.9 }}
          />
        </div>
      </div>
    );
  }
);

PrintableQrCard.displayName = 'PrintableQrCard';
