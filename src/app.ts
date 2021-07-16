import * as zksync from "zksync";
import * as ethers from "ethers";
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

async function getProviderAndWallet() {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const MNEMONIC = process.env.MNEMONIC!;

  const ethersProvider = ethers.getDefaultProvider("rinkeby");
  const ethWallet =
    ethers.Wallet.fromMnemonic(MNEMONIC).connect(ethersProvider);

  const syncProvider = await zksync.getDefaultProvider("rinkeby");
  const syncWallet = await zksync.Wallet.fromEthSigner(ethWallet, syncProvider);

  console.log(ethWallet.address);

  return { ethersProvider, ethWallet, syncProvider, syncWallet };
}

async function mint() {
  const { syncWallet } = await getProviderAndWallet();
  const contentHash =
    "0x571de4a8d1e739e2045f9543eebb535c9169dfdc56f00521bb8b9f0c93d44b49";

  const nft = await syncWallet.mintNFT({
    recipient: syncWallet.address(),
    contentHash,
    feeToken: "ETH",
  });
  console.log({ nft });

  const receipt = await nft.awaitReceipt();

  console.log({ receipt });
}

async function unlock() {
  const { syncWallet } = await getProviderAndWallet();
  const changePubkey = await syncWallet.setSigningKey({
    feeToken: "ETH",
    ethAuthType: "ECDSA",
  });

  console.log({ changePubkey });
  // Wait until the tx is committed
  await changePubkey.awaitReceipt();
}

async function deposit() {
  const { syncWallet } = await getProviderAndWallet();
  const deposit = await syncWallet.depositToSyncFromEthereum({
    depositTo: syncWallet.address(),
    token: "ETH",
    amount: ethers.utils.parseEther("0.01"),
  });

  console.log({ deposit });
}

async function showState() {
  const { syncWallet } = await getProviderAndWallet();
  const state = await syncWallet.getAccountState();

  console.log(state.committed.nfts);
  console.log(state.verified.nfts);
}

async function withdrawNFT() {
  const id = 66805;

  const { syncWallet } = await getProviderAndWallet();

  const withdraw = await syncWallet.withdrawNFT({
    to: syncWallet.address(),
    token: id,
    feeToken: "ETH",
  });

  console.log({ withdraw });

  const receipt = await withdraw.awaitReceipt();

  console.log({ receipt });
}

async function main(): Promise<void> {
  // await deposit();
  // await unlock();
  // await mint();

  // await withdrawNFT();
  await showState();
}

main();

process.on("unhandledRejection", (reason) => {
  console.error(reason);
  process.exit(1);
});
