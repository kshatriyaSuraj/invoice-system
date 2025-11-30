import { Suspense } from "react";
import PreviewClient from "./PreviewClient";

export default function Page() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center">Loading preview...</div>}
    >
      <PreviewClient />
    </Suspense>
  );
}
