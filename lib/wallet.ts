import { PetraWallet } from "petra-plugin-wallet-adapter";
import { Network } from "@aptos-labs/ts-sdk";

export const wallets = [new PetraWallet()];

export const walletNetwork = Network.TESTNET;