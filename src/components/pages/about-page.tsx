// =============================================================================
// SL HUB COMPUTER - About Page Component
// =============================================================================
// Purpose: Comprehensive About Us page with company information
// Features: Hero section, our story, mission/vision cards, 6 services with
//           icons, our values, why choose us, visit us CTA
// Content: All SL HUB specific - Deiyandara, Sri Lanka based computer store
// =============================================================================

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Cpu,
  Laptop,
  Wrench,
  Camera,
  Smartphone,
  Code,
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  MessageCircle,
  ShieldCheck,
  Users,
  Heart,
  Target,
  Eye,
  Award,
  ThumbsUp,
  Zap,
  HeadphonesIcon,
  Building2,
} from "lucide-react";
import { useStore } from "@/store/use-store";

// ---------------------------------------------------------------------------
// Services Data - What SL HUB Offers
// ---------------------------------------------------------------------------
const services = [
  {
    icon: <Cpu className="w-8 h-8" />,
    title: "PC Parts & Accessories",
    description:
      "Wide range of genuine computer components, peripherals, and accessories from top brands at competitive prices.",
    color: "bg-blue-100 dark:bg-blue-900 text-blue-600",
  },
  {
    icon: <Wrench className="w-8 h-8" />,
    title: "Custom PC Building",
    description:
      "Expert custom PC building service tailored to your needs — gaming, office, workstation, or budget builds.",
    color: "bg-green-100 dark:bg-green-900 text-green-600",
  },
  {
    icon: <Laptop className="w-8 h-8" />,
    title: "Laptop & PC Repair",
    description:
      "Professional repair services for laptops and desktops. Hardware fixes, screen replacements, and more.",
    color: "bg-purple-100 dark:bg-purple-900 text-purple-600",
  },
  {
    icon: <Camera className="w-8 h-8" />,
    title: "CCTV & Security (Tiandy)",
    description:
      "Authorized Tiandy CCTV solutions — installation, configuration, and maintenance for homes and businesses.",
    color: "bg-red-100 dark:bg-red-900 text-red-600",
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: "Mobile Accessories",
    description:
      "Quality mobile accessories including chargers, cases, screen protectors, earphones, and power banks.",
    color: "bg-orange-100 dark:bg-orange-900 text-orange-600",
  },
  {
    icon: <Code className="w-8 h-8" />,
    title: "Software Solutions",
    description:
      "OS installation, software setup, virus removal, data recovery, and networking solutions for all devices.",
    color: "bg-teal-100 dark:bg-teal-900 text-teal-600",
  },
];

// ---------------------------------------------------------------------------
// Values Data
// ---------------------------------------------------------------------------
const values = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Genuine Products",
    description: "We only sell authentic, warrantied products from authorized distributors.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Customer First",
    description: "Every decision we make puts our customers' needs and satisfaction first.",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Community Driven",
    description: "Proudly serving the Deiyandara community and surrounding areas since day one.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Fast & Reliable",
    description: "Quick turnaround on repairs, fast delivery, and responsive customer support.",
  },
];

// ---------------------------------------------------------------------------
// Why Choose Us Data
// ---------------------------------------------------------------------------
const whyChooseUs = [
  {
    icon: <Award className="w-5 h-5" />,
    text: "Authorized dealer for top tech brands",
  },
  {
    icon: <ThumbsUp className="w-5 h-5" />,
    text: "Competitive pricing with no hidden costs",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    text: "Genuine warranty on all products",
  },
  {
    icon: <HeadphonesIcon className="w-5 h-5" />,
    text: "After-sales support and technical guidance",
  },
  {
    icon: <Wrench className="w-5 h-5" />,
    text: "Expert technicians for repairs and builds",
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    text: "Local store with personal, friendly service",
  },
];

import { PageHero } from "@/components/layout/page-hero";

// ---------------------------------------------------------------------------
// About Page Component
// ---------------------------------------------------------------------------
export function AboutPage() {
  const { setCurrentView } = useStore();

  return (
    <div className="min-h-screen">
      <PageHero 
        title="SL HUB COMPUTER"
        subtitle="Your Trusted Tech Partner"
        description="Located on Hakmana Road, Deiyandara — we bring quality computer products, expert services, and reliable solutions to the heart of Sri Lanka."
        gradient="from-blue-600 to-blue-800"
        icon={<Cpu className="w-12 h-12" />}
      />

      {/* ---- Our Story ---- */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              SL HUB COMPUTER was founded with a simple mission — to provide the
              people of Deiyandara and surrounding areas with access to quality
              computer products and professional tech services at fair prices.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              What started as a small computer shop on Hakmana Road has grown
              into a trusted one-stop destination for everything tech. From
              custom PC builds and laptop repairs to CCTV security solutions and
              software services, we&apos;ve expanded our expertise to serve the
              diverse needs of our community.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, SL HUB COMPUTER is known for its genuine products,
              skilled technicians, and the personal touch that only a local
              business can offer. We&apos;re not just a store — we&apos;re your
              technology partner.
            </p>
          </div>
        </div>
      </section>

      <Separator />

      {/* ---- Mission & Vision ---- */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Mission */}
            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-blue-600">
                  Our Mission
                </h3>
                <p className="text-muted-foreground">
                  To provide affordable, reliable, and high-quality technology
                  products and services to our community, empowering individuals
                  and businesses with the tools they need to succeed in the
                  digital age.
                </p>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-green-600">
                  Our Vision
                </h3>
                <p className="text-muted-foreground">
                  To become the most trusted and preferred technology partner in
                  the Southern Province of Sri Lanka, known for excellence in
                  service, product quality, and customer satisfaction.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ---- What We Offer ---- */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">What We Offer</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From hardware to software, repairs to security — we&apos;ve got
              all your technology needs covered under one roof.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card
                key={service.title}
                className="hover:shadow-lg transition-all group"
              >
                <CardContent className="p-6">
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${service.color} group-hover:scale-110 transition-transform`}
                  >
                    {service.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ---- Our Values ---- */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Our Values</h2>
            <p className="text-muted-foreground">
              The principles that guide everything we do at SL HUB COMPUTER.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((value) => (
              <div
                key={value.title}
                className="text-center p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600">
                  {value.icon}
                </div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Why Choose Us ---- */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Why Choose SL HUB?</h2>
              <p className="text-muted-foreground">
                Here&apos;s what sets us apart from the rest.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {whyChooseUs.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center shrink-0 text-blue-600">
                    {item.icon}
                  </div>
                  <p className="font-medium text-sm pt-2">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ---- Visit Us CTA ---- */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Visit Us Today!</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Come visit our store in Deiyandara for the best deals on computer
            products and services. We&apos;re always happy to help!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>Hakmana Road, Deiyandara, Sri Lanka</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <a href="tel:0710678944" className="hover:underline">
                071 067 8944
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <a
                href="mailto:slhubcomputer@gmail.com"
                className="hover:underline"
              >
                slhubcomputer@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8 text-blue-200">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Mon-Sat: 9AM-7PM | Sun: 10AM-5PM</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://wa.me/94710678944"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Us
              </Button>
            </a>
            <a href="tel:0710678944">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Phone className="w-4 h-4 mr-2" /> Call Now
              </Button>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=100063543731370"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Globe className="w-4 h-4 mr-2" /> Facebook
              </Button>
            </a>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              onClick={() => setCurrentView("contact")}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
