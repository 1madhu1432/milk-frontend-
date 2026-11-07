import * as React from "react";
import { Auth } from "@/components/ui/auth-form-1";

export default function DemoMain() {
  return (
    <div className="w-full flex justify-center items-center min-h-screen p-4 bg-slate-950">
      <Auth />
    </div>
  );
}
