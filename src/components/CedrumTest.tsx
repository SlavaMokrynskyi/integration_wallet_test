import { useState, useEffect } from "react";
import {
  Cedra,
  CedraConfig,
  Network,
  AccountAddress,
  Account,
} from "@cedra-labs/ts-sdk";

const CedrumTest = () => {
  const [address, setAddress] = useState<AccountAddress | null>(null);
  const [alice,setAlice] = useState<Account | null>(null)
  const [cedra, setCedra] = useState<Cedra | null>(null);

  useEffect(() => {
    const cedraInstance = new Cedra(
      new CedraConfig({ network: Network.DEVNET }),
    );
    setCedra(cedraInstance);

    const alice = Account.generate()
    setAlice(alice);
  }, []);

  const handleConnect = async () => {
    if (window.cedrum) {
      try {
        const acc = await window.cedrum.connect();
        const address = AccountAddress.fromString(acc.address);
        setAddress(address);
      } catch (error) {
        console.error("Connection error:", error);
        alert("Failed to connect: " + error);
      }
    }
  };

  const handleGetAddress = async () => {
    if (window.cedrum) {
      try {
        const acc = await window.cedrum.account();
        console.log("Account address:", acc.address);
        const address = AccountAddress.fromString(acc.address);
        setAddress(address);
      } catch (error) {
        console.error("Get address error:", error);
      }
    }
  };

  const handleTnx = async () => {
    if (!window.cedrum) {
      alert("Please install Cedrum wallet");
      return;
    }

    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    if (!cedra) {
      alert("Cedra SDK not initialized");
      return;
    }

    if (!alice) {
      alert("Alice account not created");
      return;
    }

    try {
      await cedra.fundAccount({
        accountAddress: alice.accountAddress,
        amount: 100_000_000
      });

      const signedTnx = await window.cedrum.signAndSubmitTransaction({
        sender: address,
        data: {
          function: "0x1::cedra_account::transfer",
          functionArguments: [alice.accountAddress, 10000],
        }
      });
      const transaction = signedTnx.transaction;
      console.log("signedTnx", signedTnx);

      const response = await cedra.waitForTransaction({
        transactionHash: transaction.hash
      });

      console.log("Transaction response:", response);
      alert("Transaction successful!");
    } catch (error) {
      console.error("Tnx error:", error);
      alert("Tnx failed: " + error);
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
          onClick={handleTnx}
          style={{ padding: "10px 20px", cursor: "pointer" }}
          disabled={!cedra || !address}
        >
          Sign and Submit
        </button>
      </div>
      <div>
        <h2>Account: {address?.toString() || "Not connected"}</h2>
        <p style={{ fontSize: "12px", color: "#666" }}>
          {cedra ? "✓ Cedra SDK initialized" : "Initializing Cedra SDK..."}
        </p>
      </div>
    </div>
  );
};

export default CedrumTest;
