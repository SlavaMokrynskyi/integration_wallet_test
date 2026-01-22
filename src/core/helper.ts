import {
  Account,
  AccountAddress,
  Cedra,
  CedraConfig,
  Network,
  Ed25519PrivateKey,
  PrivateKey,
  PrivateKeyVariants,
} from "@cedra-labs/ts-sdk";

// Constants for V2 contract
const MODULE_ADDRESS =
  "0xfd73afb5be0cb876ac9dd0fe6deef6c0f5c8dd67ceddbcdb39661aaa4609b543"; // Deployed contract address
const NETWORK = Network.DEVNET;
const FULLNODE_URL = "https://devnet.cedra.dev/v1";
//const FAUCET_URL = "https://faucet-api.cedra.dev";
const MODULE_NAME = "ExpandNFT";
const ONE_CEDRA_IN_OCTAS = 100_000_000;

// ⚠️ SECURITY WARNING: This is for educational purposes only!
// NEVER hardcode or reveal private keys in production code or commit them to version control.
// In production, use environment variables, secure key management systems, or hardware wallets.
const DEPLOYER_PRIVATE_KEY_RAW =
  "0xbd326a410d2b1482c54292b2ed73c17287e31826d1a02d306bf5bf38eb6b1878"; // Deployer account private key (LEARNING PURPOSE ONLY)

// Format private key for AIP-80 compliance (educational demonstration)
console.log(DEPLOYER_PRIVATE_KEY_RAW);
const DEPLOYER_PRIVATE_KEY = PrivateKey.formatPrivateKey(
  DEPLOYER_PRIVATE_KEY_RAW,
  PrivateKeyVariants.Ed25519,
);

// Generate unique session ID for this run
const SESSION_ID: number = Date.now();

interface Metadata {
  name: string;
  description: string;
  uri: string;
}
/**
 * Funds an account with 1 CEDRA
 */
const fundAccount = async (
  cedra: Cedra,
  accountAddress: AccountAddress,
  name: string,
): Promise<void> => {
  try {
    console.log(`Funding ${name}`);
    await cedra.faucet.fundAccount({
      accountAddress,
      amount: ONE_CEDRA_IN_OCTAS,
    });
    console.log(`✓ ${name} funded successfully`);
  } catch (error) {
    console.error(`✗ Failed to fund ${name}:`, error);
    throw error;
  }
};

/**
 * Check if collection exists
 */
const checkCollectionExists = async (
  cedra: Cedra,
  creatorAddress: string,
): Promise<boolean> => {
  try {
    const result = await cedra.view({
      payload: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::collection_exists`,
        typeArguments: [],
        functionArguments: [creatorAddress],
      },
    });

    return result[0] as boolean;
  } catch (error) {
    console.error("Failed to check collection existence:", error);
    return false;
  }
};

/**
 * Get NFTs owned by an account
 */
export const getNFTsOwned = async (
  cedra: Cedra,
  address: AccountAddress,
): Promise<any[]> => {
  try {
    const tokens = await cedra.getAccountOwnedTokens({
      accountAddress: address,
      options: {
        tokenStandard: "v2",
      },
    });

    return tokens;
  } catch (error) {
    console.error("Failed to get owned NFTs:", error);
    return [];
  }
};

/**
 * Mint an NFT to a specific address
 */
export const mintNFT = async (
  cedra: Cedra,
  signer: Account,
  to: AccountAddress,
  name: string,
  description: string,
  uri: string,
): Promise<string> => {
  try {
    console.log(`Minting "${name}"`);

    const mintTxn = await cedra.transaction.build.simple({
      sender: signer.accountAddress,
      data: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::mint_nft`,
        functionArguments: [to, name, description, uri],
      },
    });

    const mintRes = await cedra.signAndSubmitTransaction({
      signer,
      transaction: mintTxn,
    });
    await cedra.waitForTransaction({ transactionHash: mintRes.hash });
    console.log(`✓ "${name}" minted`);

    return mintRes.hash;
  } catch (error) {
    console.error(`✗ Failed to mint "${name}":`, error);
    throw error;
  }
};

/**
 * Mint a bunch NFT to a specific address
 */

export const mint_butch_nft = async (
  cedra: Cedra,
  signer: Account,
  to: AccountAddress,
  nft_metadata: Metadata[],
): Promise<string> => {
  try {
    const names = nft_metadata.map((m) => m.name);
    const descriptions = nft_metadata.map((m) => m.description);
    const uris = nft_metadata.map((m) => m.uri);

    const mintTxn = await cedra.transaction.build.simple({
      sender: signer.address,
      data: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::mint_batch_nft`,
        functionArguments: [to, names, descriptions, uris],
      },
    });

    return mintTxn;
  } catch (error) {
    console.error(`✗ Failed to mint NFTs : `, error);
    throw error;
  }
};

/**
 * Transfer an NFT from one account to another
 */
export const transferNFT = async (
  cedra: Cedra,
  signer: Account,
  objectAddress: string,
  to: AccountAddress,
  tokenName: string,
): Promise<string> => {
  try {
    console.log(`Transferring "${tokenName}"`);

    const transferTxn = await cedra.transaction.build.simple({
      sender: signer.accountAddress,
      data: {
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::transfer_nft`,
        functionArguments: [objectAddress, to],
      },
    });

    const transferRes = await cedra.signAndSubmitTransaction({
      signer,
      transaction: transferTxn,
    });
    await cedra.waitForTransaction({ transactionHash: transferRes.hash });
    console.log(`✓ "${tokenName}" transferred`);

    return transferRes.hash;
  } catch (error) {
    console.error(`✗ Failed to transfer "${tokenName}":`, error);
    throw error;
  }
};
