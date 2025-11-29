"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { PageCard } from "./PageCard";

type Page = {
  id: bigint;
  owner: string;
  title: string;
  contentChunks: string[];
  mimeType: string;
  totalSize: bigint;
  createdAt: bigint;
  totalTips: bigint;
};

interface PageFeedProps {
  limit?: number;
  ownerFilter?: string;
}

export const PageFeed = ({ limit, ownerFilter }: PageFeedProps) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: totalPages } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getTotalPages",
  });

  // For now, since the contract might not be deployed, just show placeholder
  useEffect(() => {
    setPages([]);
    setLoading(false);
  }, [totalPages, limit, ownerFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📄</div>
        <h3 className="text-xl font-semibold mb-2">No pages found</h3>
        <p className="text-base-content/70 mb-6">
          {ownerFilter ? "You haven't created any pages yet." : "Be the first to deploy a page on-chain!"}
        </p>
        {!ownerFilter && (
          <Link href="/create" className="btn btn-primary">
            Create First Page
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pages.map((page) => (
        <PageCard key={page.id.toString()} page={page} />
      ))}
    </div>
  );
};
