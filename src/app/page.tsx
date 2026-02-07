'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Bot,
  MessageSquare,
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Expert Mentors',
    description: 'Connect with experienced professionals in your field who can guide your career.',
  },
  {
    icon: Bot,
    title: 'AI-Powered Guidance',
    description: 'Get instant advice from our AI mentor powered by cutting-edge technology.',
  },
  {
    icon: MessageSquare,
    title: 'Real-time Chat',
    description: 'Communicate seamlessly with mentors through our instant messaging system.',
  },
  {
    icon: Star,
    title: 'Verified Reviews',
    description: 'Read authentic reviews from mentees to find the perfect mentor for you.',
  },
];

const benefits = [
  'Personalized mentor matching based on your goals',
  'Flexible scheduling that fits your lifestyle',
  'AI-generated action plans for your growth',
  'Track your progress and celebrate milestones',
];

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  // Show nothing while checking auth or redirecting
  if (!isLoaded || isSignedIn) {
    return null;
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
              <span className="text-black font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold text-white">MentorConnect</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-white/70 hover:text-white transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link href="/sign-up" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Mentoring Platform</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Accelerate Your
              <br />
              <span className="gradient-text">Career Growth</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Connect with expert mentors, get AI-powered guidance, and unlock your full potential.
              Your journey to success starts here.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/mentors" className="btn-secondary text-lg px-8 py-4">
                Browse Mentors
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
            <div className="text-center">
              <p className="text-4xl font-bold gradient-text">500+</p>
              <p className="text-muted-foreground">Expert Mentors</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold gradient-text">10K+</p>
              <p className="text-muted-foreground">Active Mentees</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold gradient-text">4.9</p>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our platform combines human expertise with AI technology to provide you with
              the best mentoring experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose <span className="gradient-text">MentorConnect</span>?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                We&apos;re not just another mentoring platform. We combine the wisdom of
                experienced mentors with the power of AI to create a personalized
                growth experience.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="card p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="avatar w-12 h-12">AI</div>
                  <div>
                    <p className="font-semibold">AI Mentor</p>
                    <p className="text-sm text-muted-foreground">Always available</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="chat-bubble-other p-3">
                    <p className="text-sm">Hi! I&apos;m your AI mentor. What would you like to learn today?</p>
                  </div>
                  <div className="chat-bubble-user p-3 ml-8">
                    <p className="text-sm text-black">I want to become a full-stack developer</p>
                  </div>
                  <div className="chat-bubble-other p-3">
                    <p className="text-sm">Great choice! Let me create a personalized learning path for you...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="card p-12 text-center bg-gradient-to-br from-primary to-secondary text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Career?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of professionals who are already accelerating their growth
              with MentorConnect.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-white/90 transition-colors"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-bold">MentorConnect</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} MentorConnect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
