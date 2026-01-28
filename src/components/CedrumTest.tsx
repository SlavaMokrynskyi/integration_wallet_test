import { useState, useEffect } from "react";
import {
  Cedra,
  CedraConfig,
  Network,
  AccountAddress,
  Account,
  SimpleTransaction,
  AccountAuthenticator,
  Deserializer,
  Ed25519Signature,
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
        console.log(acc);
        
        const address = AccountAddress.fromString(acc.accountAddress);
        setAddress(address);
      } catch (error) {
        console.error("Connection error:", error);
        alert("Failed to connect: " + error);
      }
    }
  };

  const handleDisconnect = async () => {
    if (window.cedrum) {
      try {
        const response = await window.cedrum.disconnect();
        console.log("Disconnected:", response);
        setAddress(null);
      } catch (error) {
        console.error("Disconnection error:", error);
      }
    }
  };

  const handleIsConnected = async () => {
    if (window.cedrum) {
      try {
        const isConnected = await window.cedrum.isConnected();
        console.log("Is connected:", isConnected);
        alert("Is connected: " + isConnected);
      } catch (error) {
        console.error("isConnected error:", error);
      }
    }
  };

  const handleGetAccount = async () => {
    if (window.cedrum) {
      try {
        const acc = await window.cedrum.account();
        console.log("Account address:", acc.accountAddress);
        console.log("Account publicKey:", acc.publicKey);
        const address = AccountAddress.fromString(acc.accountAddress);
        setAddress(address);
      } catch (error) {
        console.error("Get address error:", error);
      }
    }
  };

  const handleTnx = async () => {
    console.log(alice);
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
      const submittedTnx = await window.cedrum.signAndSubmitTransaction({
        data: {
          function: "0x1::cedra_account::transfer",
          functionArguments: [alice.accountAddress.toString(), 10000],
        }
      });
      const response = await cedra.waitForTransaction({
        transactionHash: submittedTnx.hash
      });

      console.log("Transaction response:", response);
      alert("Transaction successful!");
    } catch (error) {
      console.error("Tnx error:", error);
      alert("Tnx failed: " + error);
    }
  };

  const handleSignTnx = async () => {
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

      const response = await window.cedrum.signTransaction({
        data: {
          function: "0x1::cedra_account::transfer",
          functionArguments: [alice.accountAddress.toString(), 10000],
        }
      });

      console.log("response : ", response);

      const transactionBytes = new Uint8Array(response.transaction);
      const senderAuthenticatorBytes = new Uint8Array(response.senderAuthenticator);

      console.log("transactionBytes : ", transactionBytes);
      console.log("senderAuthenticatorBytes : ", senderAuthenticatorBytes);

      const transaction = SimpleTransaction.deserialize(new Deserializer(transactionBytes));
      const senderAuthenticator = AccountAuthenticator.deserialize(new Deserializer(senderAuthenticatorBytes));

      const submittedTnx = await cedra.transaction.submit.simple({
        senderAuthenticator: senderAuthenticator,
        transaction: transaction
      });

      const tnxResponse = await cedra.waitForTransaction({
        transactionHash: submittedTnx.hash
      });

      console.log("Transaction response:", tnxResponse);
      alert("Sign Transaction successful!");

    }catch (error) {
      console.error("Sign Tnx error:", error);
      alert("Sign Tnx failed: " + error);
    }
  };

  const handleGetBalance = async () => {
    if(!window.cedrum){
      alert("Please install Cedrum wallet");
      return;
    }
    try {
      const balance = await window.cedrum.getBalance();
      console.log("Balance:", balance);
      alert("Balance: " + balance);
    }catch (error) {
      console.error("Get Balance error:", error);
      alert("Get Balance failed: " + error);
    }
  };

  const handleSignMessage = async () => {
    if(!window.cedrum){
      alert("Please install Cedrum wallet");
      return;
    }
    try {
      const message = "Hello, Cedrum!";
      const serializedMessage = Array.from(new TextEncoder().encode(message)); 
      const signedMessage = await window.cedrum.signMessage({ message: serializedMessage });

      console.log("Signed Message (raw):", signedMessage);

      const deserializedSignature = Ed25519Signature.deserialize(new Deserializer(new Uint8Array(signedMessage.signedMessage)));
      console.log("Signed Message:", deserializedSignature);

    }catch (error) {
      console.error("Sign Message error:", error);
      alert("Sign Message failed: " + error);
    
    }
  }

  const handleGetNetwork = async () => {
    if(!window.cedrum){
      alert("Please install Cedrum wallet");
      return;
    }
    try {
      const network = await window.cedrum.getNetwork();
      console.log("Network:", network);
      alert("Network: " + network);
    }catch (error) {
      console.error("Get Network error:", error);
      alert("Get Network failed: " + error);
    }
  };

  const handleSwitchNetwork = async () => {
    if(!window.cedrum){
      alert("Please install Cedrum wallet");
      return;
    }
    try {
      const targetNetwork = Network.TESTNET;
      const switchResult = await window.cedrum.switchNetwork({ network: targetNetwork });
      console.log("Switch Network Result:", switchResult);
      alert("Switched to network: " + targetNetwork);
    }catch (error) {
      console.error("Switch Network error:", error);
      alert("Switch Network failed: " + error);
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
          onClick={handleDisconnect}
          style={{ padding: "10px 20px", cursor: "pointer" }}
          disabled={!cedra || !address}
        >
          Disconnect Wallet
        </button>
        <button
          onClick={handleIsConnected}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          Is Connected
        </button>
        <button
          onClick={handleGetAccount}
          style={{ padding: "10px 20px", cursor: "pointer" }}
          disabled={!window.cedrum}
        >
          Get Account
        </button>
        <button
          onClick={handleTnx}
          style={{ padding: "10px 20px", cursor: "pointer" }}
          disabled={!cedra || !address}
        >
          Sign and Submit
        </button>
        <button
          onClick={handleSignTnx}
          style={{ padding: "10px 20px", cursor: "pointer" }}
          disabled={!cedra || !address}
        >
          Sign
        </button>
        <button
          onClick={handleSignMessage}
          style={{ padding: "10px 20px", cursor: "pointer" }}
          disabled={!cedra || !address}
        >
          Sign Message
        </button>
        <button
          onClick={handleGetBalance}
          style={{ padding: "10px 20px", cursor: "pointer" }}
          disabled={!cedra || !address}
        >
          Get Balance
        </button>
        <button
          onClick={handleGetNetwork}
          style={{ padding: "10px 20px", cursor: "pointer" }}
          disabled={!cedra || !address}
        >
          Get Network
        </button>
        <button
          onClick={handleSwitchNetwork}
          style={{ padding: "10px 20px", cursor: "pointer" }}
          disabled={!cedra || !address}
        >
          Switch Network
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
