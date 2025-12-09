
'use client';

import { forwardRef } from 'react';
import Image from 'next/image';

type PrintableQrCardProps = {
  shopName: string;
  qrUrl: string;
  logoSrc: string;
};

export const PrintableQrCard = forwardRef<HTMLDivElement, PrintableQrCardProps>(
  ({ shopName, qrUrl, logoSrc }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[400px] h-[600px] bg-white flex flex-col font-sans"
      >
        {/* Top decorative shapes */}
        <div className="relative h-[100px] w-full">
          <div
            className="absolute -top-10 -left-10 w-[200px] h-[150px] bg-[#001F54] origin-bottom-left"
            style={{ transform: 'rotate(-45deg)', opacity: 0.8 }}
          />
          <div
            className="absolute -top-10 left-0 w-[200px] h-[150px] bg-[#003F88] origin-bottom-left"
            style={{ transform: 'rotate(-30deg)', opacity: 0.9 }}
          />
          <div
            className="absolute -top-10 right-0 w-[200px] h-[150px] bg-[#00509E] origin-bottom-right"
            style={{ transform: 'rotate(25deg)', opacity: 0.75 }}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-between text-center px-8">

          {/* Logo */}
          <div className="w-48 h-auto">
            <Image
              src={logoSrc}
              alt="Attendry Logo"
              width={300}
              height={100}
              className="object-contain w-full h-full"
              priority
            />
          </div>

          {/* QR Code */}
          <div className="p-2 border-4 border-[#003F88] rounded-2xl bg-white shadow-lg my-4">
            {qrUrl ? (
              <div className="w-[220px] h-[220px]">
                <Image
                  src={qrUrl}
                  alt={`QR for ${shopName}`}
                  width={220}
                  height={220}
                  className="rounded-lg object-contain"
                />
              </div>
            ) : (
              <div className="w-[220px] h-[220px] bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-sm text-gray-500">QR Code</p>
              </div>
            )}
          </div>

          {/* CTA Text */}
          <div className="w-full flex flex-col items-center">
             <h2 className="text-3xl font-bold text-[#003F88]">
                SCAN TO CHECK-IN
            </h2>
            <p className="mt-2 text-lg font-medium text-gray-600 text-center max-w-[320px]">
              Employees: Use your phone camera to scan.
            </p>
          </div>
        </div>

        {/* Bottom decorative shapes */}
        <div className="relative h-[100px] w-full overflow-hidden">
          <div
            className="absolute -bottom-16 -right-12 w-[250px] h-[180px] bg-[#001F54] origin-top-right"
            style={{ transform: 'rotate(-55deg)', opacity: 0.8 }}
          />
          <div
            className="absolute -bottom-16 right-0 w-[250px] h-[180px] bg-[#003F88] origin-top-right"
            style={{ transform: 'rotate(-40deg)', opacity: 0.9 }}
          />
        </div>
      </div>
    );
  }
);

PrintableQrCard.displayName = 'PrintableQrCard';
