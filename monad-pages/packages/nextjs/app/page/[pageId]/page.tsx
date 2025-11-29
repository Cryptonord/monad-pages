"use client";

import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { usePathname } from "next/navigation";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";

const PageViewer: NextPage = () => {
  const pathname = usePathname();
  const [pageId, setPageId] = useState<bigint | null>(null);

  // Extract pageId from the URL path
  useEffect(() => {
    if (pathname) {
      const id = BigInt(pathname.split("/").pop() || "0");
      setPageId(id);
    }
  }, [pathname]);

  // Fetch the page data from the smart contract using its ID
  const { data: page, isLoading } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getPage",
    args: [pageId],
    // Only enable the hook once we have a valid pageId
    enabled: pageId !== null,
  });

  // Reconstruct the full content from the on-chain chunks
  const fullContent = page?.contentChunks.join("") || "";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!page || page.owner === "0x0000000000000000000000000000000000000000") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold">404</h1>
          <p>Page not found.</p>
        </div>
      </div>
    );
  }

  // Render the content within an iframe for security and isolation
  // This prevents the hosted HTML/CSS/JS from affecting the main dApp's styles or logic.
  return (
    <div className="w-full h-screen flex flex-col">
      <div className="bg-base-300 p-2 text-center text-xs text-base-content/80 shadow-md z-10">
        <p>
          Viewing on-chain page <span className="font-bold">#{page.id.toString()}</span> | Title:{" "}
          <span className="font-bold">{page.title}</span> | Owner: <Address address={page.owner} size="xs" />
        </p>
      </div>
      <iframe
        srcDoc={fullContent}
        title={page.title}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin" // Security sandbox
      />
    </div>
  );
};

export default PageViewer;
