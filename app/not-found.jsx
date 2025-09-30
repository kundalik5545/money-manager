"use client";
import Link from "next/link";
import { ArrowLeft, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout"; // adjust path if needed

export default function NotFoundPage() {
  return (
    <DashboardLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-3xl px-6 py-12 text-center">
          {/* Illustration */}
          <div className="mx-auto mb-8 w-48 h-48 flex items-center justify-center">
            <svg
              viewBox="0 0 512 512"
              className="w-full h-full opacity-90"
              aria-hidden="true"
              focusable="false"
            >
              <g fill="none" fillRule="evenodd">
                <circle cx="256" cy="256" r="240" fill="#EFF6FF" />
                <path
                  d="M170 330c20-60 80-110 146-110s126 50 146 110"
                  stroke="#BFDBFE"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <rect
                  x="176"
                  y="176"
                  width="160"
                  height="40"
                  rx="8"
                  fill="#DBEAFE"
                />
                <path
                  d="M192 200h128"
                  stroke="#93C5FD"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </g>
            </svg>
          </div>

          {/* Title + message */}
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 text-foreground">
            Page not found
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            The page you’re looking for doesn’t exist, or you may not have
            access to it. If you think this is a mistake, you can report it to
            the team.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to dashboard
              </Button>
            </Link>

            <Link href="/support" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                <Bug className="mr-2 h-4 w-4" />
                Report an issue
              </Button>
            </Link>
          </div>

          {/* Optional hint */}
          <p className="mt-6 text-xs text-muted-foreground">
            Tip: check the URL for typos or visit the{" "}
            <Link href="/help" className="underline">
              help center
            </Link>
            .
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
