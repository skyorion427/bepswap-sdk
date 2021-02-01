import { Client as BncClient } from '@xchainjs/xchain-binance';
import { Balance } from '@xchainjs/xchain-client';

import { AmountType } from './entities';
import { Amount } from './entities/amount';
import { Asset } from './entities/asset';
import { AssetAmount } from './entities/assetAmount';

export class Wallet {
  private bncClient: BncClient;
  private balances: AssetAmount[] = [];

  constructor(bncClient: BncClient) {
    this.bncClient = bncClient;
  }

  getBalance = async (): Promise<AssetAmount[]> => {
    try {
      const balances: Balance[] = await this.bncClient.getBalance();

      this.balances = balances.map((data: Balance) => {
        const { asset, amount } = data;

        const assetObj = new Asset(asset.chain, asset.symbol);
        const amountObj = new Amount(amount.amount(), AmountType.BASE_AMOUNT);

        return new AssetAmount(assetObj, amountObj);
      });

      return this.balances;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  hasAmountInBalance = async (assetAmount: AssetAmount): Promise<boolean> => {
    try {
      await this.getBalance();

      const assetBalance = this.balances.find((data: AssetAmount) =>
        data.asset.eq(assetAmount.asset),
      );

      if (!assetBalance) return false;

      return assetBalance.amount.gte(assetAmount.amount);
    } catch (error) {
      return Promise.reject(error);
    }
  };
}
