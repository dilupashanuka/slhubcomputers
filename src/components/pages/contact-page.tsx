// =============================================================================
// SL HUB COMPUTER - Contact Page Component
// =============================================================================
// Purpose: Contact page with form and business information
// Features: Contact form (name, email, phone, subject, message) POSTs to
//           /api/contact, contact info sidebar, business hours, map placeholder,
//           WhatsApp/Call action buttons
// =============================================================================

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  Mail,
  Clock,
  Globe,
  MapPin,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Contact Form Data Interface
// ---------------------------------------------------------------------------
interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Contact Page Component
// ---------------------------------------------------------------------------
export function ContactPage() {
  // ---- Form State ----
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ---- Handle Input Change ----
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---- Handle Form Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!formData.subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    if (!formData.message.trim()) {
      toast.error("Please enter your message");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
        toast.success("Message sent successfully! We'll get back to you soon.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        toast.error(data.error || "Failed to send message. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again or contact us via WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Contact Info Items ----
  const contactInfo = [
    {
      icon: <MapPin className="w-5 h-5 text-blue-600" />,
      label: "Address",
      value: "Hakmana Road, Deiyandara, Sri Lanka",
    },
    {
      icon: <Phone className="w-5 h-5 text-blue-600" />,
      label: "Hotline",
      value: "071 067 8944",
      href: "tel:0710678944",
    },
    {
      icon: <MessageCircle className="w-5 h-5 text-green-600" />,
      label: "WhatsApp",
      value: "071 067 8944",
      href: "https://wa.me/94710678944",
    },
    {
      icon: <Mail className="w-5 h-5 text-blue-600" />,
      label: "Email",
      value: "slhubcomputer@gmail.com",
      href: "mailto:slhubcomputer@gmail.com",
    },
    {
      icon: <Globe className="w-5 h-5 text-blue-600" />,
      label: "Facebook",
      value: "SL HUB COMPUTER",
      href: "https://www.facebook.com/profile.php?id=100063543731370",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Contact Us</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Have a question, need help with a product, or want to place an order?
          We&apos;d love to hear from you. Reach out through any of the channels
          below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* ---- Left: Contact Form ---- */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {submitted ? (
                /* Success State */
                <div className="text-center py-10">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Thank you for contacting SL HUB COMPUTER. We&apos;ll review
                    your message and get back to you as soon as possible.
                  </p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                /* Contact Form */
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="07X XXX XXXX"
                      />
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject">
                        Subject <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="What's this about?"
                        required
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" /> Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ---- Right: Contact Info Sidebar ---- */}
        <div className="space-y-6">
          {/* Contact Details Card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg">Get in Touch</h3>

              {contactInfo.map((info) => (
                <div key={info.label} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{info.icon}</div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {info.label}
                    </p>
                    {info.href ? (
                      <a
                        href={info.href}
                        target={
                          info.href.startsWith("http") ? "_blank" : undefined
                        }
                        rel={
                          info.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="text-sm font-medium hover:text-blue-600 transition-colors"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium">{info.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Business Hours Card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" /> Business Hours
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium">9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium">10:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Poya Days</span>
                  <span className="font-medium text-yellow-600">Closed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-6 space-y-3">
              <h3 className="font-bold text-lg">Quick Contact</h3>
              <a
                href="https://wa.me/94710678944"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Us
                </Button>
              </a>
              <a href="tel:0710678944" className="block">
                <Button variant="outline" className="w-full">
                  <Phone className="w-4 h-4 mr-2" /> Call: 071 067 8944
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Map Placeholder */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-t-lg flex flex-col items-center justify-center text-muted-foreground">
                <MapPin className="w-10 h-10 mb-2 text-blue-400" />
                <p className="text-sm font-medium">SL HUB COMPUTER</p>
                <p className="text-xs">Hakmana Road, Deiyandara</p>
              </div>
              <div className="p-3 text-center">
                <a
                  href="https://maps.google.com/?q=Deiyandara+Sri+Lanka"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Open in Google Maps →
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
