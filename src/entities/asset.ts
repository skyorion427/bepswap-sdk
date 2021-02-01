import {
  assetFromString,
  assetToString,
  Chain,
  currencySymbolByAsset,
  AssetBNB,
  AssetRune67C,
  AssetRuneB1A,
} from '@xchainjs/xchain-util';

import { Pool } from './pool';
import { Price } from './price';

export type AssetNetwork = 'mainnet' | 'testnet';

export interface IAsset {
  readonly chain: Chain;
  readonly symbol: string;
  readonly ticker: string;
  readonly decimal: number;

  toString(): string;
  currencySymbol(): string;
  eq(asset: Asset): boolean;
  isRUNE67C(): boolean;
  isRUNEB1A(): boolean;
  isRUNE(): boolean;
  isBNB(): boolean;
  sortsBefore(asset: Asset): boolean;
  priceIn(quoteAsset: Asset, pools: Pool[]): Price;
}

export class Asset implements IAsset {
  public readonly chain: Chain;
  public readonly symbol: string;
  public readonly ticker: string;
  public readonly decimal: number;

  public static BNB(): Asset {
    return new Asset(AssetBNB.chain, AssetBNB.symbol, 8);
  }

  public static RUNE67C(): Asset {
    return new Asset(AssetRune67C.chain, AssetRune67C.symbol, 8);
  }

  public static RUNEB1A(): Asset {
    return new Asset(AssetRuneB1A.chain, AssetRuneB1A.symbol, 8);
  }

  public static fromAssetString(asset: string, decimal = 8): Asset | null {
    const { chain, symbol } = assetFromString(asset) || {};

    if (chain && symbol) {
      return new Asset(chain, symbol, decimal);
    }

    return null;
  }

  constructor(chain: Chain, symbol: string, decimal = 8) {
    this.chain = chain;
    this.symbol = symbol;
    this.ticker = this.getTicker(symbol);
    this.decimal = decimal;
  }

  private getTicker(symbol: string): string {
    return symbol.split('-')[0];
  }

  private getAssetObj() {
    return { chain: this.chain, symbol: this.symbol, ticker: this.ticker };
  }

  toString(): string {
    return assetToString(this.getAssetObj());
  }

  currencySymbol(): string {
    return currencySymbolByAsset(this.getAssetObj());
  }

  eq(asset: Asset): boolean {
    return (
      this.chain === asset.chain &&
      this.symbol === asset.symbol &&
      this.ticker === asset.ticker &&
      this.decimal === asset.decimal
    );
  }

  isRUNE67C(): boolean {
    return this.eq(Asset.RUNE67C());
  }

  isRUNEB1A(): boolean {
    return this.eq(Asset.RUNEB1A());
  }

  isRUNE(): boolean {
    return this.isRUNEB1A() || this.isRUNE67C();
  }

  isBNB(): boolean {
    return this.eq(Asset.BNB());
  }

  sortsBefore(asset: Asset): boolean {
    if (this.chain !== asset.chain) {
      return this.chain < asset.chain;
    }

    return this.symbol < asset.symbol;
  }

  priceIn(quoteAsset: Asset, pools: Pool[]): Price {
    return new Price(this, quoteAsset, pools);
  }
}
