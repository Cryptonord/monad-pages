"use client";

import Link from "next/link";
import { formatEther } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { HeartIcon, EyeIcon, CalendarIcon } from "@heroicons/react/24/outline";

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

interface PageCardProps {
  page: Page;
}

export const PageCard = ({ page }: PageCardProps) => {
  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const formatSize = (bytes: bigint) => {
    const kb = Number(bytes) / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const getMimeTypeDisplay = (mimeType: string) => {
    if (mimeType.includes("html")) return "HTML";
    if (mimeType.includes("css")) return "CSS";
    if (mimeType.includes("javascript")) return "JS";
    if (mimeType.includes("json")) return "JSON";
    if (mimeType.includes("text")) return "Text";
    return "File";
  };

  const getPreviewContent = (contentChunks: string[]) => {
    const fullContent = contentChunks.join("");
    if (fullContent.length > 150) {
      return fullContent.substring(0, 150) + "...";
    }
    return fullContent;
  };

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow border border-base-200">
      <div className="card-body">
        <div className="flex justify-between items-start mb-3">
          <h3 className="card-title text-lg truncate flex-1 mr-2">{page.title}</h3>
          <div className="badge badge-secondary badge-sm">
            {getMimeTypeDisplay(page.mimeType)}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-base-200 rounded-lg p-3 mb-3 text-sm font-mono text-xs overflow-hidden">
          {getPreviewContent(page.contentChunks)}
        </div>

        {/* Owner */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-base-content/70">By:</span>
          <Address address={page.owner} size="sm" />
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center text-sm text-base-content/70 mb-4">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            {formatDate(page.createdAt)}
          </div>
          <div className="text-right">
            <div>{formatSize(page.totalSize)}</div>
          </div>
        </div>

        {/* Tips */}
        {page.totalTips > 0n && (
          <div className="flex items-center gap-1 mb-3 text-sm">
            <HeartIcon className="h-4 w-4 text-red-500" />
            <span className="font-semibold">{formatEther(page.totalTips)} ETH</span>
            <span className="text-base-content/70">in tips</span>
          </div>
        )}

        {/* Actions */}
        <div className="card-actions justify-end">
          <Link 
            href={`/page/${page.id}`} 
            className="btn btn-primary btn-sm"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            View
          </Link>
        </div>
      </div>
    </div>
  );
};
