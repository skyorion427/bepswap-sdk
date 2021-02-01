import { Network } from '@xchainjs/xchain-binance';

import { AssetAmount, Asset, Amount, AmountType } from '../entities';

// default slip limit is 30%
export const DEFAULT_SLIP_LIMIT = 30;

// Minimum amount to send memo on-binance chain
export const MINIMUM_AMOUNT = 0.00000001;

export const WITHDRAW_TX_RUNEB1A_AMOUNT = new AssetAmount(
  Asset.RUNEB1A(),
  new Amount(MINIMUM_AMOUNT, AmountType.ASSET_AMOUNT),
);

export const WITHDRAW_TX_RUNE67C_AMOUNT = new AssetAmount(
  Asset.RUNE67C(),
  new Amount(MINIMUM_AMOUNT, AmountType.ASSET_AMOUNT),
);

export const getWithdrawTxRuneAmount = (network: Network) => {
  if (network === 'mainnet') {
    return WITHDRAW_TX_RUNEB1A_AMOUNT;
  }

  return WITHDRAW_TX_RUNE67C_AMOUNT;
};

export const WITHDRAW_TX_BNB_AMOUNT = new AssetAmount(
  Asset.BNB(),
  new Amount(MINIMUM_AMOUNT, AmountType.ASSET_AMOUNT),
);

export const _0_AMOUNT = Amount.fromAssetAmount(0);
