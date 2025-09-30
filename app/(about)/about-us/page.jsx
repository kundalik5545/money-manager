import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Shield,
  Users,
  Target,
  Award,
  Heart,
  Lightbulb,
  CheckCircle,
} from "lucide-react";

const AboutUs = () => {
  const features = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Smart Analytics",
      description:
        "Advanced financial insights powered by intelligent data analysis",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Bank-Level Security",
      description:
        "Your financial data is protected with enterprise-grade encryption",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Multi-User Support",
      description:
        "Perfect for individuals, families, and small business teams",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Goal Tracking",
      description:
        "Set and achieve your financial goals with our tracking tools",
    },
  ];

  const values = [
    {
      icon: <Heart className="h-5 w-5" />,
      title: "User-Centric",
      description:
        "Every feature is designed with your financial success in mind",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Privacy First",
      description: "Your financial data remains private and secure, always",
    },
    {
      icon: <Lightbulb className="h-5 w-5" />,
      title: "Innovation",
      description: "Continuously improving to bring you the latest in fintech",
    },
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "$2M+", label: "Money Managed" },
    { number: "99.9%", label: "Uptime" },
    { number: "4.9★", label: "User Rating" },
  ];

  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            About Us{" "}
          </h1>
          <h2 className="text-md md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Empowering Your Financial Journey
          </h2>
          <p className="text-md text-muted-foreground leading-relaxed">
            We're on a mission to make personal finance management accessible,
            intuitive, and powerful for everyone. Our platform combines
            cutting-edge technology with user-friendly design to help you take
            control of your financial future.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="text-center p-6 border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
            >
              <CardContent className="p-0">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission Section */}
        <Card className="mb-16 border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Financial wellness shouldn't be a privilege reserved for the
                  few. We believe everyone deserves access to powerful financial
                  tools that help them understand, plan, and optimize their
                  money management.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Simplify complex financial data</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Provide actionable insights</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Ensure complete data privacy</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white flex items-center justify-center">
                  <Award className="h-24 w-24 opacity-80" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose FinanceHub?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've built our platform with the features that matter most to you
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 border-0 shadow-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:shadow-xl transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex p-4 bg-white dark:bg-slate-800 rounded-full mb-4 shadow-lg">
                    <div className="text-blue-600 dark:text-blue-400">
                      {value.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="inline-block border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Transform Your Finances?
              </h3>
              <p className="mb-6 opacity-90">
                Join thousands of users who've already taken control of their
                financial future
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-slate-100 transition-colors">
                  Get Started Free
                </button>
                <button className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                  View Dashboard
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
