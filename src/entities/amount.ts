import BigNumber from 'bignumber.js';
import invariant from 'tiny-invariant';

export enum Rounding {
  ROUND_DOWN,
  ROUND_HALF_UP,
  ROUND_UP,
}

export enum AmountType {
  BASE_AMOUNT,
  ASSET_AMOUNT,
}

const roundingMode = {
  [Rounding.ROUND_DOWN]: BigNumber.ROUND_DOWN,
  [Rounding.ROUND_HALF_UP]: BigNumber.ROUND_HALF_UP,
  [Rounding.ROUND_UP]: BigNumber.ROUND_UP,
};

export interface IAmount {
  readonly baseAmount: BigNumber;
  readonly assetAmount: BigNumber;
  readonly decimal: number;

  _0_AMOUNT: Amount;

  add(amount: Amount): Amount;
  sub(amount: Amount): Amount;
  mul(value: BigNumber.Value | Amount): Amount;
  div(value: BigNumber.Value | Amount): Amount;
  gte(amount: Amount): boolean;
  gt(amount: Amount): boolean;
  lte(amount: Amount): boolean;
  lt(amount: Amount): boolean;
  eq(amount: Amount): boolean;
  toSignificant(
    significantDigits?: number,
    format?: BigNumber.Format,
    rounding?: Rounding,
  ): string;
  toFixed(
    decimalPlaces?: number,
    format?: BigNumber.Format,
    rounding?: Rounding,
  ): string;
}

export class Amount implements IAmount {
  public readonly assetAmount: BigNumber;
  public readonly baseAmount: BigNumber;
  public readonly decimal: number;

  public static fromBaseAmount(
    amount: BigNumber.Value,
    decimal: number,
  ): Amount {
    return new Amount(amount, AmountType.BASE_AMOUNT, decimal);
  }

  public static fromAssetAmount(
    amount: BigNumber.Value,
    decimal: number,
  ): Amount {
    return new Amount(amount, AmountType.ASSET_AMOUNT, decimal);
  }

  constructor(
    amount: BigNumber.Value,
    type: AmountType = AmountType.BASE_AMOUNT,
    decimal: number,
  ) {
    this.decimal = decimal;
    if (type === AmountType.BASE_AMOUNT) {
      this.baseAmount = new BigNumber(amount);
      this.assetAmount = this.baseAmount.dividedBy(decimal);
    } else {
      this.assetAmount = new BigNumber(amount);
      this.baseAmount = this.assetAmount.multipliedBy(decimal);
    }
  }

  get _0_AMOUNT() {
    return new Amount(0, AmountType.ASSET_AMOUNT, this.decimal);
  }

  add(amount: Amount): Amount {
    invariant(this.decimal === amount.decimal, 'Decimal must be same');
    return new Amount(
      this.baseAmount.plus(amount.baseAmount),
      AmountType.BASE_AMOUNT,
      this.decimal,
    );
  }

  sub(amount: Amount): Amount {
    invariant(this.decimal === amount.decimal, 'Decimal must be same');
    return new Amount(
      this.baseAmount.minus(amount.baseAmount),
      AmountType.BASE_AMOUNT,
      this.decimal,
    );
  }

  mul(value: BigNumber.Value | Amount): Amount {
    if (value instanceof Amount) {
      return new Amount(
        this.assetAmount.multipliedBy(value.assetAmount),
        AmountType.ASSET_AMOUNT,
        this.decimal,
      );
    }
    return new Amount(
      this.assetAmount.multipliedBy(value),
      AmountType.ASSET_AMOUNT,
      this.decimal,
    );
  }

  div(value: BigNumber.Value | Amount): Amount {
    if (value instanceof Amount) {
      return new Amount(
        this.assetAmount.dividedBy(value.assetAmount),
        AmountType.ASSET_AMOUNT,
        this.decimal,
      );
    }
    return new Amount(
      this.assetAmount.dividedBy(value),
      AmountType.ASSET_AMOUNT,
      this.decimal,
    );
  }

  gte(amount: Amount): boolean {
    invariant(this.decimal === amount.decimal, 'Decimal must be same');
    return this.baseAmount.isGreaterThanOrEqualTo(amount.baseAmount);
  }

  gt(amount: Amount): boolean {
    invariant(this.decimal === amount.decimal, 'Decimal must be same');
    return this.baseAmount.isGreaterThan(amount.baseAmount);
  }

  lte(amount: Amount): boolean {
    invariant(this.decimal === amount.decimal, 'Decimal must be same');
    return this.baseAmount.isLessThanOrEqualTo(amount.baseAmount);
  }

  lt(amount: Amount): boolean {
    invariant(this.decimal === amount.decimal, 'Decimal must be same');
    return this.baseAmount.isLessThan(amount.baseAmount);
  }

  eq(amount: Amount): boolean {
    invariant(this.decimal === amount.decimal, 'Decimal must be same');
    return this.baseAmount.isEqualTo(amount.baseAmount);
  }

  toSignificant(
    significantDigits: number = 8,
    format: BigNumber.Format = { groupSeparator: '' },
    rounding: Rounding = Rounding.ROUND_DOWN,
  ): string {
    invariant(
      Number.isInteger(significantDigits),
      `${significantDigits} is not an integer.`,
    );
    invariant(significantDigits > 0, `${significantDigits} is not positive.`);

    BigNumber.config({ FORMAT: format });

    const significant = new BigNumber(
      this.assetAmount.toPrecision(significantDigits, roundingMode[rounding]),
    );

    return significant.toFormat();
  }

  toFixed(
    decimalPlaces: number = 8,
    format: BigNumber.Format = { groupSeparator: '' },
    rounding: Rounding = Rounding.ROUND_DOWN,
  ): string {
    invariant(
      Number.isInteger(decimalPlaces),
      `${decimalPlaces} is not an integer.`,
    );
    invariant(decimalPlaces > 0, `${decimalPlaces} is not positive.`);

    BigNumber.config({ FORMAT: format });

    const fixed = new BigNumber(
      this.assetAmount.toFixed(decimalPlaces, roundingMode[rounding]),
    );

    return fixed.toFormat(decimalPlaces);
  }
}
