"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { ethers, BrowserProvider, Contract } from "ethers";
// The ABI will be copied to this location after compiling the contract.
import SiteHostAbi from "../lib/siteHostAbi.json";

// --- CONFIGURATION ---
// These values are pulled from your .env.local file.
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const rpcUrl = process.env.NEXT_PUBLIC_MONAD_RPC_URL!;

// Helper function to split a string into chunks of a specific size.
// This is crucial for sending data to the smart contract without hitting gas limits.
const chunkString = (str: string, size: number): string[] => {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);
  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substring(o, size);
  }
  return chunks;
};

export default function Home() {
  // --- STATE MANAGEMENT ---
  const [file, setFile] = useState<File | null>(null);
  const [subdomain, setSubdomain] = useState("");
  const [status, setStatus] = useState("");
  const [deployedUrl, setDeployedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);

  // Tip Jar State
  const [tipSubdomain, setTipSubdomain] = useState("");
  const [tipAmount, setTipAmount] = useState("0.01");


  // --- INITIALIZATION ---
  // Effect hook to initialize the ethers provider and contract instance.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);
      const contractInstance = new ethers.Contract(contractAddress, SiteHostAbi.abi, browserProvider);
      setContract(contractInstance);
    } else {
        setStatus("Please install a web3 wallet like MetaMask.");
    }
  }, []);


  // --- EVENT HANDLERS ---

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDeploy = async () => {
    if (!file || !subdomain) {
      setStatus("Please select a file and choose a subdomain name.");
      return;
    }
    if (!provider || !contract) {
        setStatus("Wallet provider not initialized. Please refresh the page.");
        return;
    }

    setIsLoading(true);
    setDeployedUrl("");
    setStatus("Reading and preparing your file...");

    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");

    reader.onload = async (readerEvent) => {
      try {
        const content = readerEvent.target?.result as string;
        
        // The core logic for on-chain storage: chunking the data.
        // 24KB is a generally safe chunk size for most EVM chains.
        const CHUNK_SIZE = 24 * 1024;
        const contentChunks = chunkString(content, CHUNK_SIZE);
        
        setStatus(`Connecting to wallet... Please approve the connection.`);
        const signer = await provider.getSigner();
        const contractWithSigner = contract.connect(signer) as Contract;

        setStatus(`Sending transaction with ${contentChunks.length} data chunks... Please confirm in your wallet.`);
        const tx = await (contractWithSigner as any).deploySite(subdomain, contentChunks, file.type);
        
        setStatus("Transaction sent! Waiting for blockchain confirmation...");
        await tx.wait(); // Wait for the transaction to be mined.

        // For local testing, the gateway is at /api/serve/
        const newUrl = `/api/serve/${subdomain}`;
        setDeployedUrl(newUrl);
        setStatus(`✅ Deployed! Your site is live.`);
      } catch (error: any) {
        console.error(error);
        setStatus(`Error: ${error.reason || error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setStatus("Error reading the selected file.");
      setIsLoading(false);
    };
  };

  const handleSendTip = async () => {
    if (!tipSubdomain || parseFloat(tipAmount) <= 0) {
      setStatus("Please enter a valid site name and tip amount.");
      return;
    }
     if (!provider || !contract) {
        setStatus("Wallet provider not initialized. Please refresh the page.");
        return;
    }

    setIsLoading(true);
    setStatus(`Preparing to tip ${tipSubdomain}...`);

    try {
        const signer = await provider.getSigner();
        const contractWithSigner = contract.connect(signer) as Contract;

        setStatus("Looking up site ID...");
        const siteId = await contract.subdomainToId(tipSubdomain);

        if (Number(siteId) === 0 && (await contract.sites(0)).name !== tipSubdomain) {
             setStatus(`Error: Site '${tipSubdomain}' not found.`);
             setIsLoading(false);
             return;
        }

        setStatus(`Sending ${tipAmount} MONAD... Please confirm in your wallet.`);
        const tx = await (contractWithSigner as any).tip(siteId, {
            value: ethers.parseEther(tipAmount),
        });

        await tx.wait();
        setStatus(`✅ Successfully sent a ${tipAmount} MONAD tip to ${tipSubdomain}!`);

    } catch (error: any) {
        console.error(error);
        setStatus(`Error: ${error.reason || error.message}`);
    } finally {
        setIsLoading(false);
    }
  }


  // --- RENDER ---
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24 bg-gray-900 text-white font-mono">
      <div className="w-full max-w-2xl p-8 space-y-8 bg-gray-800 rounded-xl shadow-2xl border border-cyan-500/20">
        
        {/* Header Section */}
        <div className="text-center">
            <h1 className="text-4xl font-bold text-cyan-400">Monad Pages</h1>
            <p className="mt-2 text-gray-400">Host permanent, uncensorable websites on-chain.</p>
        </div>

        {/* Deploy Site Section */}
        <div className="space-y-6">
            <div>
                <label htmlFor="subdomain" className="block text-sm font-medium text-gray-300 mb-1">1. Choose Your Subdomain</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                <input
                    type="text"
                    id="subdomain"
                    className="flex-1 block w-full rounded-none rounded-l-md bg-gray-700 border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm p-3"
                    placeholder="my-awesome-site"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    disabled={isLoading}
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-600 bg-gray-600 text-gray-400 sm:text-sm">
                    .monad.page
                </span>
                </div>
            </div>

            <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-1">2. Select Your Website File</label>
                <input 
                id="file-upload" 
                type="file" 
                onChange={handleFileChange}
                accept=".html,.htm,.js,.css"
                className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 cursor-pointer"
                disabled={isLoading}
                />
                {file && <p className="text-xs text-gray-500 mt-1">Selected: {file.name} ({Math.round(file.size / 1024)} KB)</p>}
            </div>

            <button
                onClick={handleDeploy}
                disabled={isLoading || !file || !subdomain}
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all"
            >
                {isLoading ? 'Processing...' : 'Deploy to Monad'}
            </button>
        </div>

        {/* Status and Result Section */}
        {status && (
            <div className="mt-6 p-4 bg-gray-700/50 rounded-lg text-center">
                <p className="text-sm text-gray-300">{status}</p>
                {deployedUrl && (
                    <a href={deployedUrl} target="_blank" rel="noopener noreferrer" className="block mt-2 text-cyan-400 hover:underline break-all">
                        View Your Live Site: {deployedUrl}
                    </a>
                )}
            </div>
        )}

        {/* Tip Jar Section */}
        <div className="border-t border-gray-700 pt-8 space-y-4">
            <h2 className="text-xl font-bold text-center text-cyan-400">Support a Creator</h2>
            <p className="text-center text-gray-400 text-sm -mt-2 mb-4">Send a tip directly to a site owner's wallet.</p>
            <input 
                type="text" 
                placeholder="site-subdomain-to-tip" 
                value={tipSubdomain}
                onChange={(e) => setTipSubdomain(e.target.value)} 
                className="w-full p-3 rounded-md bg-gray-700 border-gray-600"
                disabled={isLoading}
            />
            <input 
                type="number" 
                step="0.01" 
                min="0.01"
                value={tipAmount} 
                onChange={(e) => setTipAmount(e.target.value)} 
                className="w-full p-3 rounded-md bg-gray-700 border-gray-600"
                disabled={isLoading}
            />
            <button 
                onClick={handleSendTip}
                disabled={isLoading || !tipSubdomain || !tipAmount}
                className="w-full py-3 px-4 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all"
            >
                Send Tip
            </button>
        </div>

      </div>
    </main>
  );
}
