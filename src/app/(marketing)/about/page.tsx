
import Link from "next/link"
import { IndianFlagIcon } from "@/components/ui/indian-flag-icon";

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-24 lg:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Our Mission</div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Making Business Simpler for a Growing India
            </h1>
            <p className="text-lg text-muted-foreground">
              Attendry was born from a simple observation: while large corporations have access to sophisticated HR tools, the small and medium-sized businesses that form the backbone of our economy are often left with manual, error-prone methods for tracking employee attendance.
            </p>
            <p className="text-lg text-muted-foreground">
              We are a passionate team of engineers and designers based in TamilNadu, dedicated to building technology that empowers Indian businesses. Our mission is to create affordable, intuitive, and powerful tools that save time, reduce administrative burden, and allow business owners to focus on what they do best—growth.
            </p>
             <div className="flex items-center gap-2 font-semibold text-muted-foreground">
                <IndianFlagIcon />
                <span>Proudly built in India, for India.</span>
            </div>
          </div>
          <div className="space-y-8">
            <div className="p-6 rounded-xl bg-muted/50 border-2 border-primary/20 hover:border-primary transition-all">
              <h3 className="text-xl font-bold mb-2">Our Vision</h3>
              <p className="text-muted-foreground">
                To be the leading provider of simple, effective operational software for the millions of MSMEs and retail businesses across the country.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-muted/50 border-2 border-primary/20 hover:border-primary transition-all">
              <h3 className="text-xl font-bold mb-2">Our Values</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><span className="font-medium text-foreground">Simplicity:</span> If it's not easy to use, we haven't done our job.</li>
                <li><span className="font-medium text-foreground">Affordability:</span> Powerful tools should not be a luxury.</li>
                <li><span className="font-medium text-foreground">Reliability:</span> Our technology must be as dependable as the businesses we serve.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
