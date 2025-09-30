import DashboardLayout from "@/components/layout/DashboardLayout";
import React from "react";

const AboutLayout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <DashboardLayout bgColor="">{children}</DashboardLayout>
    </div>
  );
};

export default AboutLayout;
