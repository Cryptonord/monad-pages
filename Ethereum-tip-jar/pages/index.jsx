import abi from "../utils/BuyMeACoffee.json";
import { ethers } from "ethers";
import Head from "next/head";
import React, { useEffect, useState, useCallback } from "react";
import styles from "../styles/Home.module.css";

export default function Home() {
  // Contract Address & ABI - Updated for Monad Testnet
  const contractAddress = "0x781b950309BB1BE8FD83453d2B31652a8bdb9658"; // Your deployed contract address
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  };

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please install MetaMask to use this dApp!");
        return;
      }

      // Check if we're on the Monad testnet
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      const monadTestnetChainId = '0x279F'; // 10143 in hex

      if (chainId !== monadTestnetChainId) {
        try {
          // Try to switch to Monad testnet
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: monadTestnetChainId }],
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: monadTestnetChainId,
                    chainName: 'Monad Testnet',
                    rpcUrls: ['https://testnet-rpc.monad.xyz'],
                    nativeCurrency: {
                      name: 'Monad',
                      symbol: 'MON',
                      decimals: 18,
                    },
                    blockExplorerUrls: ['https://testnet-explorer.monad.xyz'],
                  },
                ],
              });
            } catch (addError) {
              console.log('Failed to add Monad testnet to MetaMask');
              alert('Failed to add Monad testnet to MetaMask. Please add it manually.');
              return;
            }
          } else {
            console.log('Failed to switch to Monad testnet');
            alert('Please switch to Monad testnet in MetaMask manually.');
            return;
          }
        }
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log('Connection error:', error);
      alert('Failed to connect to MetaMask. Please try again.');
    }
  };

  const buyCoffee = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      if (!currentAccount) {
        alert("Please connect your wallet first!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      const buyMeACoffee = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      console.log("buying coffee..");
      const coffeeTxn = await buyMeACoffee.buyCoffee(
        name ? name : "Anonymous",
        message ? message : "Enjoy your coffee!",
        { value: ethers.utils.parseEther("0.001") }
      );

      await coffeeTxn.wait();

      console.log("mined ", coffeeTxn.hash);
      console.log("coffee purchased!");
      alert("Coffee sent successfully! ☕");

      // Clear the form fields.
      setName("");
      setMessage("");
      
      // Refresh memos
      getMemos();
    } catch (error) {
      console.log('Error buying coffee:', error);
      alert("Failed to send coffee. Please check your wallet and try again.");
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = useCallback(async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }
    } catch (error) {
      console.log(error);
    }
  }, [contractAddress, contractABI]); // dependencies for useCallback

  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name,
        },
      ]);
    };

    const { ethereum } = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    };
  }, [contractABI, getMemos]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Buy me a coffee on Monad</title>
        <meta name="description" content="Tipping site on Monad Testnet" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>☕ Buy me a coffee on Monad</h1>
        <p className={styles.description}>
          Send a tip on the Monad testnet with a personal message!
        </p>

        {currentAccount ? (
          <div className={styles.formContainer}>
            <div className={styles.walletInfo}>
              <p>Connected: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}</p>
            </div>
            <form className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Your Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name (optional)"
                  value={name}
                  onChange={onNameChange}
                  className={styles.input}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="message">Send me a message</label>
                <textarea
                  rows={3}
                  placeholder="Enjoy your coffee! ☕"
                  id="message"
                  value={message}
                  onChange={onMessageChange}
                  className={styles.textarea}
                  required
                />
              </div>
              
              <button 
                type="button" 
                onClick={buyCoffee}
                className={styles.coffeeButton}
              >
                ☕ Send Coffee for 0.001 MON
              </button>
            </form>
          </div>
        ) : (
          <div className={styles.connectContainer}>
            <p>Connect your wallet to send tips on Monad testnet</p>
            <button onClick={connectWallet} className={styles.connectButton}>
              🔗 Connect MetaMask
            </button>
          </div>
        )}
      </main>

      {currentAccount && memos.length > 0 && (
        <section className={styles.memosSection}>
          <h2>☕ Recent Coffee Messages</h2>
          <div className={styles.memosContainer}>
            {memos.map((memo, idx) => (
              <div key={idx} className={styles.memoCard}>
                <div className={styles.memoMessage}>"{memo.message}"</div>
                <div className={styles.memoInfo}>
                  <span className={styles.memoName}>From: {memo.name || 'Anonymous'}</span>
                  <span className={styles.memoTime}>
                    {memo.timestamp ? new Date(memo.timestamp * 1000).toLocaleString() : 'Unknown time'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className={styles.footer}>
        <p>Built on Monad Testnet by{' '}
          <a
            href="https://github.com/EPW80"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mohammed Rayan A
          </a>
        </p>
      </footer>
    </div>
  );
}
