import { Amount } from '../entities/amount';
import { Asset } from '../entities/asset';
import { AssetAmount } from '../entities/assetAmount';

export const NETWORK_FEE = new AssetAmount(
  Asset.RUNEB1A(),
  Amount.fromAssetAmount(1),
);
