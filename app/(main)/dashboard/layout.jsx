import DashboardLayout from "@/components/layout/DashboardLayout";
import React from "react";

const MainLayout = ({ children }) => {
  return (
    <div className="">
      <DashboardLayout>{children}</DashboardLayout>
    </div>
  );
};

export default MainLayout;
