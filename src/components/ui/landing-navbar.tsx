"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Compass } from "lucide-react";

export function LandingNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="container flex h-16 items-center justify-between px-4">
        <Logo />

        <Button variant="gradient" size="sm" asChild>
          <Link href="/explore" className="flex items-center gap-2">
            <Compass className="h-4 w-4" />
            Khám phá ngay
          </Link>
        </Button>
      </div>
    </header>
  );
}
