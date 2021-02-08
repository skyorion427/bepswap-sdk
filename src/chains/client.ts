import {
  Client as BncClient,
  MultiTransfer,
  Network,
} from '@xchainjs/xchain-binance';
import { TxHash } from '@xchainjs/xchain-client';
import { baseAmount } from '@xchainjs/xchain-util';
import { MidgardV2, NetworkType as MidgardNetwork } from 'midgard-sdk-v2';

import {
  getWithdrawTxRuneAmount,
  WITHDRAW_TX_BNB_AMOUNT,
  _0_AMOUNT,
} from './constants/amount';
import { Swap, Memo } from './entities';
import {
  TxParams,
  AddLiquidityParams,
  WithdrawParams,
  MultiSendParams,
} from './types';
import { Wallet } from './wallet';

export interface IBNBChain {
  getBncClient(): BncClient;
  getMidgard(): MidgardV2;

  getWallet(): Wallet;
  transfer(tx: TxParams): Promise<TxHash>;
  multiSend(params: MultiSendParams): Promise<TxHash>;
  swap(swap: Swap): Promise<TxHash>;
  addLiquidity(params: AddLiquidityParams): Promise<TxHash>;
  withdraw(params: WithdrawParams): Promise<TxHash>;
}

export class BNBChain implements IBNBChain {
  private midgard: MidgardV2;
  private bncClient: BncClient;
  private wallet: Wallet;
  public readonly network: Network;

  constructor({
    network = 'mainnet',
    phrase,
  }: {
    network?: Network;
    phrase?: string;
  }) {
    this.network = network;
    this.midgard = new MidgardV2(this.getMidgardNetwork(network));
    this.bncClient = new BncClient({
      network,
      phrase,
    });

    this.wallet = new Wallet(this.bncClient);
  }

  /**
   * return midgard network type
   *
   * @param network mainnet or testnet
   */
  private getMidgardNetwork(network: Network): MidgardNetwork {
    if (network === 'testnet') return 'testnet';
    return 'chaosnet';
  }

  /**
   * get xchain-binance client
   */
  getBncClient(): BncClient {
    return this.bncClient;
  }

  /**
   * get midgard client
   */
  getMidgard(): MidgardV2 {
    return this.midgard;
  }

  /**
   * get wallet client
   */
  getWallet(): Wallet {
    return this.wallet;
  }

  /**
   * transfer on binance chain
   * @param {TxParams} tx transfer parameter
   */
  transfer = async (tx: TxParams): Promise<TxHash> => {
    // use xchainjs-client standard internally
    try {
      const { assetAmount, recipient, memo } = tx;
      const asset = assetAmount.asset;
      const amount = baseAmount(assetAmount.amount.baseAmount);

      return this.bncClient.transfer({
        asset: {
          chain: asset.chain,
          symbol: asset.symbol,
          ticker: asset.ticker,
        },
        amount,
        recipient,
        memo,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  };

  /**
   * multiSend on binance chain
   * @param {MultiSendParams} params transfer parameter
   */
  multiSend = async (params: MultiSendParams): Promise<TxHash> => {
    // use xchainjs-client standard internally
    try {
      const { assetAmount1, assetAmount2, recipient, memo } = params;

      const transactions: MultiTransfer[] = [
        {
          to: recipient,
          coins: [
            {
              asset: {
                chain: assetAmount1.asset.chain,
                symbol: assetAmount1.asset.symbol,
                ticker: assetAmount1.asset.ticker,
              },
              amount: baseAmount(assetAmount1.amount.baseAmount),
            },
            {
              asset: {
                chain: assetAmount2.asset.chain,
                symbol: assetAmount2.asset.symbol,
                ticker: assetAmount2.asset.ticker,
              },
              amount: baseAmount(assetAmount2.amount.baseAmount),
            },
          ],
        },
      ];

      return this.bncClient.multiSend({
        transactions,
        memo,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  };

  /**
   * swap assets
   * @param {Swap} swap Swap Object
   */
  swap = async (swap: Swap): Promise<TxHash> => {
    /**
     * 1. check if swap has sufficient fee
     * 2. get pool address
     * 3. get swap memo
     * 4. transfer input asset to pool address
     */

    try {
      if (swap.hasInSufficientFee) {
        return Promise.reject(new Error('Insufficient Fee'));
      }

      const poolAddress = await this.midgard.getPoolAddress();
      const memo = Memo.swapMemo(swap.outputAsset, poolAddress, swap.slipLimit);

      return await this.transfer({
        assetAmount: swap.inputAmount,
        recipient: poolAddress,
        memo,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  };

  /**
   * add liquidity to pool
   * @param {AddLiquidityParams} params
   */
  addLiquidity = async (params: AddLiquidityParams): Promise<TxHash> => {
    /**
     * 1. get pool address
     * 2. get add liquidity memo
     * 3. check add type (Sym or Asym add)
     * 4. add liquidity to pool
     */

    try {
      const { pool, runeAmount, assetAmount } = params;
      const poolAddress = await this.midgard.getPoolAddress();
      const memo = Memo.depositMemo(pool.asset);

      // sym stake
      if (runeAmount) {
        if (runeAmount.lte(_0_AMOUNT)) {
          return Promise.reject(new Error('Invalid Rune Amount'));
        }
        if (assetAmount.lte(_0_AMOUNT)) {
          return Promise.reject(new Error('Invalid Asset Amount'));
        }

        return await this.multiSend({
          assetAmount1: runeAmount,
          assetAmount2: assetAmount,
          recipient: poolAddress,
          memo,
        });
      } else {
        // asym stake
        if (assetAmount.lte(_0_AMOUNT)) {
          return Promise.reject(new Error('Invalid Asset Amount'));
        }

        return await this.transfer({
          assetAmount,
          recipient: poolAddress,
          memo,
        });
      }
    } catch (error) {
      return Promise.reject(error);
    }
  };

  /**
   * withdraw asset from pool
   * @param {WithdrawParams} params
   */
  withdraw = async (params: WithdrawParams): Promise<TxHash> => {
    /**
     * 1. get pool address
     * 2. get withdraw memo
     * 3. transfer withdraw tx in RUNE
     * 4. if RUNE transfer is failed, send BNB instead
     */

    return new Promise<TxHash>((resolve, reject) => {
      this.midgard
        .getPoolAddress()
        .then((poolAddress: string) => {
          const { pool, percent } = params;
          const memo = Memo.withdrawMemo(pool.asset, percent);

          this.transfer({
            assetAmount: getWithdrawTxRuneAmount(this.network),
            recipient: poolAddress,
            memo,
          })
            .then((response: TxHash) => resolve(response))
            // resend BNB if RUNE tx is failed
            .catch(() => {
              this.transfer({
                assetAmount: WITHDRAW_TX_BNB_AMOUNT,
                recipient: poolAddress,
                memo,
              })
                .then((response: TxHash) => resolve(response))
                .catch((err: Error) => reject(err));
            });
        })
        .catch((err: Error) => reject(err));
    });
  };
}
