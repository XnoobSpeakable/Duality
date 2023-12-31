import Decimal from "break_eternity.js";

export const currencyNames = {
    gold: "gold",
};

export type CurrencyName = keyof typeof currencyNames;
export interface Upgrade {
    cost: Decimal;
    currency: CurrencyName;
    costFunction?: ((upgradeAmount: Decimal) => Decimal) | null; // TODO: actually we need to use costFunction!!!
    scaleFunction: (upgradeName: UpgradeName) => void;
    extra?: VoidFunction;
    costRounding?: number;
    // wait timesBought is in an upgrade right
    // so why isnt it in the interface
    //well, its in the player data upgrades section but not in the actual upgrades section which hollds the scalefunctions n stuff
}
export interface Data { // ho i frotgo lhod no
    upgrades: Record<string, Upgrade>,
    mult: Decimal,
    gold: Decimal,
    time: 1000,
    settings: object
}

export const defaultData = {
    upgrades: {
        upgrademult: {
            cost: new Decimal(1024),
            timesBought: Decimal.dZero,
        },
        upgradetime: {
            cost: new Decimal(1e9),
            timesBought: Decimal.dZero,
        },
    },
    mult: Decimal.dTwo,
    gold: Decimal.dOne,
    time: 1000,
    settings: {} // TODO: add settings page
}
export type UpgradeName = keyof typeof defaultData.upgrades
export const UpgradeNames = Object.keys(defaultData.upgrades) as UpgradeName[];