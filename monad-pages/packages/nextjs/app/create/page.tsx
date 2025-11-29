"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { DocumentTextIcon, CodeBracketIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const CreatePage = () => {
  const { address } = useAccount();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mimeType, setMimeType] = useState("text/html");
  const [isDeploying, setIsDeploying] = useState(false);

  const { writeContractAsync: deployPage } = useScaffoldWriteContract("YourContract");

  const chunkContent = (content: string, chunkSize: number = 8000): string[] => {
    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      chunks.push(content.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const handleDeploy = async () => {
    if (!address) {
      notification.error("Please connect your wallet");
      return;
    }

    if (!title.trim()) {
      notification.error("Please enter a title");
      return;
    }

    if (!content.trim()) {
      notification.error("Please enter content");
      return;
    }

    try {
      setIsDeploying(true);
      const contentChunks = chunkContent(content);
      
      await deployPage({
        functionName: "deployPage",
        args: [title, contentChunks, mimeType],
      });

      notification.success("Page deployed successfully!");
      router.push("/my-pages");
    } catch (error) {
      console.error("Deployment error:", error);
      notification.error("Failed to deploy page");
    } finally {
      setIsDeploying(false);
    }
  };

  const presetTemplates = [
    {
      name: "Basic HTML",
      mimeType: "text/html",
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        .highlight { background-color: #f0f8ff; padding: 20px; border-radius: 8px; }
    </style>
</head>
<body>
    <h1>Welcome to My On-Chain Page</h1>
    <div class="highlight">
        <p>This page is stored entirely on the blockchain!</p>
        <p>Edit this content to create your own unique page.</p>
    </div>
    <script>
        console.log("Hello from the blockchain!");
    </script>
</body>
</html>`
    },
    {
      name: "Portfolio",
      mimeType: "text/html",
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Portfolio</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 1000px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .project { background: #f9f9f9; margin: 20px 0; padding: 20px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Name</h1>
            <p>Blockchain Developer & Creator</p>
        </div>
        
        <div class="project">
            <h3>Project 1</h3>
            <p>Description of your amazing project...</p>
        </div>
        
        <div class="project">
            <h3>Project 2</h3>
            <p>Another cool project you've built...</p>
        </div>
    </div>
</body>
</html>`
    },
    {
      name: "JSON Data",
      mimeType: "application/json",
      content: `{
  "name": "My On-Chain Data",
  "description": "This is JSON data stored on the blockchain",
  "version": "1.0.0",
  "data": {
    "items": [
      {
        "id": 1,
        "title": "First Item",
        "value": "Hello Blockchain"
      },
      {
        "id": 2,
        "title": "Second Item",
        "value": "Decentralized Storage"
      }
    ]
  },
  "metadata": {
    "created": "2024-01-01",
    "blockchain": true
  }
}`
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Create On-Chain Page</h1>
        <p className="text-lg text-base-content/70">
          Deploy your content directly to the blockchain for permanent storage
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-6">Page Details</h2>
              
              {/* Title */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-semibold">Page Title</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your page title..."
                  className="input input-bordered w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* MIME Type */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-semibold">Content Type</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={mimeType}
                  onChange={(e) => setMimeType(e.target.value)}
                >
                  <option value="text/html">HTML Document</option>
                  <option value="text/css">CSS Stylesheet</option>
                  <option value="application/javascript">JavaScript</option>
                  <option value="application/json">JSON Data</option>
                  <option value="text/plain">Plain Text</option>
                  <option value="text/markdown">Markdown</option>
                </select>
              </div>

              {/* Content */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-semibold">Content</span>
                  <span className="label-text-alt">{content.length} characters</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-96 font-mono text-sm"
                  placeholder="Enter your content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              {/* Deploy Button */}
              <div className="card-actions justify-end">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleDeploy}
                  disabled={isDeploying || !address}
                >
                  {isDeploying && <span className="loading loading-spinner"></span>}
                  <GlobeAltIcon className="h-5 w-5" />
                  {isDeploying ? "Deploying..." : "Deploy to Blockchain"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Sidebar */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title mb-4">
                <CodeBracketIcon className="h-5 w-5" />
                Templates
              </h3>
              
              <div className="space-y-3">
                {presetTemplates.map((template, index) => (
                  <button
                    key={index}
                    className="btn btn-outline btn-sm w-full justify-start"
                    onClick={() => {
                      setContent(template.content);
                      setMimeType(template.mimeType);
                      if (!title) {
                        setTitle(template.name);
                      }
                    }}
                  >
                    <DocumentTextIcon className="h-4 w-4" />
                    {template.name}
                  </button>
                ))}
              </div>

              <div className="divider"></div>

              <div className="text-sm text-base-content/70">
                <h4 className="font-semibold mb-2">Tips:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Content is stored permanently on-chain</li>
                  <li>• Maximum size: 1MB per page</li>
                  <li>• HTML pages can include CSS and JavaScript</li>
                  <li>• Users can tip you for your content</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
