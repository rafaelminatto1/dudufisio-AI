"use client"

import React, { Suspense } from "react";
import LazyFallback from "@/shared/components/ui/LazyFallback";

// Lazy-load only the named Calendar export from the local calendar module
const CalendarInner = React.lazy(() =>
  import("./calendar").then((m) => ({ default: m.Calendar }))
);

// Simple wrapper that provides a Suspense boundary and a friendly fallback
export default function CalendarLazy(props: any) {
  return (
    <Suspense fallback={<LazyFallback message="Carregando calendário..." size="md" />}>
      <CalendarInner {...props} />
    </Suspense>
  );
}