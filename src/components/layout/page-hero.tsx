"use client";

import { Cpu } from "lucide-react";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  gradient?: string;
  icon?: React.ReactNode;
}

export function PageHero({
  title,
  subtitle,
  description,
  gradient = "from-blue-600 to-blue-800",
  icon = <Cpu className="w-12 h-12" />,
}: PageHeroProps) {
  return (
    <section className={`bg-gradient-to-br ${gradient} text-white py-12 md:py-20 mb-8`}>
      <div className="container mx-auto px-4 text-center">
        {icon && (
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            {icon}
          </div>
        )}
        <h1 className="text-3xl md:text-5xl font-bold mb-3 uppercase tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-white/80 mb-2 font-medium">
            {subtitle}
          </p>
        )}
        {description && (
          <p className="text-white/70 max-w-2xl mx-auto text-sm md:text-base">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
