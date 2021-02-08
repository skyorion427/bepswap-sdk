import { FeeOptionKey } from '@xchainjs/xchain-client';
import {
  Chain,
  BTCChain,
  BNBChain,
  THORChain,
  ETHChain,
} from '@xchainjs/xchain-util';

import { AssetAmount, Pool, Percent } from '../entities';

export type Network = 'testnet' | 'mainnet';

export type TxParams = {
  assetAmount: AssetAmount;
  recipient: string;
  memo?: string;
  feeOptionKey?: FeeOptionKey;
};

export type MultiSendParams = {
  assetAmount1: AssetAmount;
  assetAmount2: AssetAmount;
  recipient: string;
  memo?: string;
};

export type AddLiquidityParams = {
  pool: Pool;
  runeAmount?: AssetAmount;
  assetAmount: AssetAmount;
};

export type WithdrawParams = {
  pool: Pool;
  percent: Percent;
};

export const supportedChains = [
  BTCChain,
  BNBChain,
  THORChain,
  ETHChain,
] as const;
export type SupportedChain = typeof supportedChains[number];

export type Balances = Record<SupportedChain, AssetAmount[]>;
