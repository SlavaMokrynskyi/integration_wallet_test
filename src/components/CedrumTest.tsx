import React, { useState, useEffect } from "react";
import { mint_butch_nft } from "../core/helper.ts";
import { Cedra, CedraConfig, Network } from "@cedra-labs/ts-sdk";

const CedrumTest = () => {
  const [account, setAcc] = useState(null);
  const [cedra, setCedra] = useState(null);

  useEffect(() => {
    const cedraInstance = new Cedra(
      new CedraConfig({ network: Network.DEVNET }),
    );
    setCedra(cedraInstance);
  }, []);

  const handleConnect = async () => {
    if (window.cedrum) {
      const acc = await window.cedrum.connect();
      console.log("Connected:", acc);
      setAcc(acc.address);
    }
  };

  const handleGetAddress = async () => {
    if (window.cedrum) {
      const acc = await window.cedrum.account();
      console.log("Account address:", acc.address);
      setAcc(acc.address);
    }
  };

  const handleMint = async () => {
    if (!window.cedrum) {
      alert("Please install Cedrum wallet");
      return;
    }

    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    if (!cedra) {
      alert("Cedra SDK not initialized");
      return;
    }

    try {
      // Get the connected account
      const acc = await window.cedrum.account();

      // Define NFT metadata
      const nftMetadata = [
        {
          name: `My NFT #1 [${Date.now()}]`,
          description: "First NFT from my dApp",
          uri: "https://metadata.cedra.dev/v2/genesis-1.json",
        },
        {
          name: `My NFT #2 [${Date.now()}]`,
          description: "Second NFT from my dApp",
          uri: "https://metadata.cedra.dev/v2/genesis-2.json",
        },
      ];

      console.log("Building mint transaction...");

      // Build the transaction (mint_butch_nft returns a transaction object)
      const transaction = await mint_butch_nft(
        cedra,
        acc, // The wallet will sign this
        acc.address, // Minting to the connected wallet address
        nftMetadata,
      );

      console.log("Signing and submitting transaction...");

      console.log("Transaction : ", transaction);

      // Sign and submit using Cedrum wallet
      const txn = await window.cedrum.signAndSubmitTransaction(transaction);

      console.log("Transaction submitted:", txn.hash);
      alert(`Transaction submitted! Hash: ${txn.hash}`);

      // Wait for transaction confirmation
      const mintRes = await cedra.waitForTransaction({
        transactionHash: txn.hash,
      });

      console.log("Transaction confirmed:", mintRes.hash);
      alert("NFTs minted successfully!");
    } catch (error) {
      console.error("Minting error:", error);
      alert("Minting failed: " + error.message);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Cedrum NFT Minter</h1>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={handleConnect}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          Connect Wallet
        </button>
        <button
          onClick={handleGetAddress}
          style={{ padding: "10px 20px", cursor: "pointer" }}
          disabled={!window.cedrum}
        >
          Get Address
        </button>
        <button
          onClick={handleMint}
          style={{ padding: "10px 20px", cursor: "pointer" }}
          disabled={!cedra || !account}
        >
          Mint NFTs
        </button>
      </div>
      <div>
        <h2>Account: {account || "Not connected"}</h2>
        <p style={{ fontSize: "12px", color: "#666" }}>
          {cedra ? "✓ Cedra SDK initialized" : "Initializing Cedra SDK..."}
        </p>
      </div>
    </div>
  );
};

export default CedrumTest;
