"use client";

import React, { useState, ChangeEvent, useEffect } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
<<<<<<< HEAD
import { Address, Balance } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { formatEther } from "viem";
=======
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { formatEther, parseEther } from "viem";
>>>>>>> 8dbc0c3df987ab6c04ac1c330043483187c9c1c7

// Helper function to split a string into chunks of a specific size.
const chunkString = (str: string, size: number): string[] => {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);
  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substring(o, size);
  }
  return chunks;
};

// Component for the deployment form
const Deployer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const { address: connectedAddress } = useAccount();

  const { writeContractAsync: deployPage, isPending: isDeploying } = useScaffoldWriteContract("YourContract");

  const handleDeploy = async () => {
    if (!file || !title) {
      notification.error("Please provide a title and select a file.");
      return;
    }
    if (!connectedAddress) {
      notification.error("Please connect your wallet to deploy.");
      return;
    }

    const notificationId = notification.loading("Reading and preparing your file...");

    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");

    reader.onload = async readerEvent => {
      try {
        const content = readerEvent.target?.result as string;
        const CHUNK_SIZE = 24 * 1024; // 24KB chunks
        const contentChunks = chunkString(content, CHUNK_SIZE);

        notification.loading("Please confirm in your wallet...", { id: notificationId });

        await deployPage({
          functionName: "deployPage",
          args: [title, contentChunks, file.type],
        });

        notification.success("Page deployed successfully!", { id: notificationId });
        setTitle("");
        setFile(null);
      } catch (error: any) {
        notification.error(`Error: ${error.shortMessage || error.message}`, { id: notificationId });
        console.error("Error deploying page:", error);
      }
    };
    reader.onerror = () => {
      notification.error("Error reading the selected file.", { id: notificationId });
    };
  };

<<<<<<< HEAD
  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl">Create a New Page</h2>
        <p>Immortalize your content on the blockchain.</p>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Page Title</span>
          </label>
          <input
            type="text"
            placeholder="e.g., My Awesome Portfolio"
            className="input input-bordered w-full"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={isDeploying}
          />
        </div>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Content File</span>
          </label>
          <input
            type="file"
            className="file-input file-input-bordered w-full"
            onChange={e => e.target.files && setFile(e.target.files[0])}
            accept=".html,.htm,.js,.css,.txt,.md"
            disabled={isDeploying}
          />
          {file && <span className="text-xs mt-1">Selected: {file.name}</span>}
        </div>
        <div className="card-actions justify-end mt-4">
          <button className="btn btn-primary" onClick={handleDeploy} disabled={isDeploying}>
            {isDeploying ? <span className="loading loading-spinner"></span> : "Deploy Page"}
          </button>
        </div>
      </div>
=======
  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl">Create a New Page</h2>
        <p>Immortalize your content on the blockchain.</p>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Page Title</span>
          </label>
          <input
            type="text"
            placeholder="e.g., My Awesome Portfolio"
            className="input input-bordered w-full"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={isDeploying}
          />
        </div>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Content File</span>
          </label>
          <input
            type="file"
            className="file-input file-input-bordered w-full"
            onChange={e => e.target.files && setFile(e.target.files[0])}
            accept=".html,.htm,.js,.css,.txt,.md"
            disabled={isDeploying}
          />
          {file && <span className="text-xs mt-1">Selected: {file.name}</span>}
        </div>
        <div className="card-actions justify-end mt-4">
          <button className="btn btn-primary" onClick={handleDeploy} disabled={isDeploying}>
            {isDeploying ? <span className="loading loading-spinner"></span> : "Deploy Page"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Component for a single page card in the feed
const PageCard: React.FC<{ page: any }> = ({ page }) => {
  const [tipAmount, setTipAmount] = useState("0.01");
  const { writeContractAsync: sendTip, isPending: isTipping } = useScaffoldWriteContract("YourContract");

  const handleSendTip = async () => {
    try {
      await sendTip({
        functionName: "tip",
        args: [page.id],
        value: parseEther(tipAmount),
      });
      notification.success("Tip sent successfully!");
    } catch (error: any) {
      notification.error(`Error: ${error.shortMessage || error.message}`);
      console.error("Error sending tip:", error);
    }
  };

  return (
    <div className="card bg-base-200 shadow-md transition-shadow hover:shadow-lg">
      <div className="card-body">
        <h3 className="card-title text-lg truncate">
          <Link href={`/page/${page.id.toString()}`} className="link link-hover">
            {page.title}
          </Link>
        </h3>
        <div className="text-sm text-base-content/70">
          <p>
            by <Address address={page.owner} size="xs" />
          </p>
          <p>ID: {page.id.toString()}</p>
          <p>Size: {Number(page.totalSize)} bytes</p>
          <p>Created: {new Date(Number(page.createdAt) * 1000).toLocaleString()}</p>
          <p>Total Tips: {formatEther(page.totalTips)} ETH</p>
        </div>
        <div className="card-actions justify-end items-center mt-2">
          <div className="join">
            <input
              type="number"
              className="input input-sm input-bordered join-item w-24"
              value={tipAmount}
              onChange={e => setTipAmount(e.target.value)}
              step="0.01"
              min="0.001"
              disabled={isTipping}
            />
            <button className="btn btn-secondary btn-sm join-item" onClick={handleSendTip} disabled={isTipping}>
              {isTipping ? <span className="loading loading-spinner-xs"></span> : "Tip"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// This component safely fetches data on the client side.
const PageFeed = () => {
  const { data: allPages, isLoading: isLoadingPages } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getAllPages",
    watch: true,
  });

  if (isLoadingPages) {
    return (
      <div className="text-center">
        <span className="loading loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {allPages && allPages.length > 0 ? (
        allPages.map(page => <PageCard key={page.id.toString()} page={page} />)
      ) : (
        <p className="text-center col-span-full">No pages deployed yet. Be the first!</p>
      )}
>>>>>>> 8dbc0c3df987ab6c04ac1c330043483187c9c1c7
    </div>
  );
};

<<<<<<< HEAD
// Component for a single page card in the feed
const PageCard: React.FC<{ page: any }> = ({ page }) => {
  const [tipAmount, setTipAmount] = useState("0.01");
  const { writeContractAsync: sendTip, isPending: isTipping } = useScaffoldWriteContract("YourContract");

  const handleSendTip = async () => {
    try {
      await sendTip({
        functionName: "tip",
        args: [page.id],
        value: BigInt(parseFloat(tipAmount) * 1e18),
      });
      notification.success("Tip sent successfully!");
    } catch (error: any) {
      notification.error(`Error: ${error.shortMessage || error.message}`);
      console.error("Error sending tip:", error);
    }
  };

  return (
    <div className="card bg-base-200 shadow-md transition-shadow hover:shadow-lg">
      <div className="card-body">
        <h3 className="card-title text-lg truncate">
          <Link href={`/page/${page.id.toString()}`} className="link link-hover">
            {page.title}
          </Link>
        </h3>
        <div className="text-sm text-base-content/70">
          <p>
            by <Address address={page.owner} size="xs" />
          </p>
          <p>ID: {page.id.toString()}</p>
          <p>Size: {Number(page.totalSize)} bytes</p>
          <p>
            Created: {new Date(Number(page.createdAt) * 1000).toLocaleString()}
          </p>
          <p>
            Total Tips: {formatEther(page.totalTips)} ETH
          </p>
        </div>
        <div className="card-actions justify-end items-center mt-2">
          <div className="join">
            <input
              type="number"
              className="input input-sm input-bordered join-item w-24"
              value={tipAmount}
              onChange={e => setTipAmount(e.target.value)}
              step="0.01"
              min="0.001"
              disabled={isTipping}
            />
            <button className="btn btn-secondary btn-sm join-item" onClick={handleSendTip} disabled={isTipping}>
              {isTipping ? <span className="loading loading-spinner-xs"></span> : "Tip"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const { data: allPages, isLoading: isLoadingPages } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getAllPages",
    watch: true, // Automatically refetches when the contract state changes
  });
=======
const Home: NextPage = () => {
  // This state ensures that data-fetching components only render on the client
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
>>>>>>> 8dbc0c3df987ab6c04ac1c330043483187c9c1c7

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 w-full max-w-4xl">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">Monad Pages</span>
            <span className="block text-lg">On-Chain Content Publishing</span>
          </h1>

          <div className="mb-12">
            <Deployer />
          </div>

          <h2 className="text-center text-2xl font-bold mb-6">Live Feed</h2>

<<<<<<< HEAD
          {isLoadingPages ? (
            <div className="text-center">
              <span className="loading loading-lg"></span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allPages && allPages.length > 0 ? (
                allPages.map(page => <PageCard key={page.id.toString()} page={page} />)
              ) : (
                <p className="text-center col-span-full">No pages deployed yet. Be the first!</p>
              )}
            </div>
          )}
=======
          {/* Conditionally render PageFeed only on the client */}
          {isClient ? <PageFeed /> : <div className="text-center"><span className="loading loading-lg"></span></div>}
>>>>>>> 8dbc0c3df987ab6c04ac1c330043483187c9c1c7
        </div>
      </div>
    </>
  );
};

<<<<<<< HEAD
export default Home;
=======
export default Home;
>>>>>>> 8dbc0c3df987ab6c04ac1c330043483187c9c1c7
