"use client";

import { Cpu } from "lucide-react";

interface PageHeroBadge {
  icon: React.ReactNode;
  text: string;
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  gradient?: string;
  icon?: React.ReactNode;
  badges?: PageHeroBadge[];
}

export function PageHero({
  title,
  subtitle,
  description,
  gradient = "from-blue-600 to-blue-800",
  icon = <Cpu className="w-12 h-12" />,
  badges,
}: PageHeroProps) {
  return (
    <section className={`bg-gradient-to-br ${gradient} text-white py-12 md:py-20 mb-8`}>
      <div className="w-full px-4 md:px-8 lg:px-12 text-center">
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
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {badges.map((badge, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-black/25 backdrop-blur-sm text-sm font-medium text-white/90 shadow-sm"
              >
                {badge.icon}
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
