import { AssetAmount, Pool, Percent } from '../entities';

export type TxParams = {
  assetAmount: AssetAmount;
  recipient: string;
  memo?: string;
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
