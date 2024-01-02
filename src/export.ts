import Decimal from "break_eternity.js";

export const currencyNames = {
    leftCurr: "time",
    rightCurr: "space"
};

export type CurrencyName = keyof typeof currencyNames;
export interface Upgrade {
    cost: Decimal;
    currency: CurrencyName;
    costFunction?: ((upgradeAmount: Decimal) => Decimal) | null; // TODO: actually we need to use costFunction!!!
    scaleFunction: (upgradeName: UpgradeName) => void;
    extra?: VoidFunction;
    costRounding?: number;
    timesBought: Decimal;
    // wait timesBought is in an upgrade right
    // so why isnt it in the interface
    //well, its in the player data upgrades section but not in the actual upgrades section which hollds the scalefunctions n stuff
}
interface Settings {
    autosaveEnabled: boolean;
}

export interface Data {
    upgrades: Record<string, Upgrade>,
    leftCurr: Decimal,
    time: number,
    settings: Settings,
    rightCurr: Decimal,
    totalClicks: Decimal
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
        upgradeclickmult: {
            cost: new Decimal(16384),
            timesBought: Decimal.dZero,
        },
    },
    leftCurr: Decimal.dOne,
    time: 1000,
    settings: {
        autosaveEnabled: true
    }, // TODO: add settings page
    rightCurr: Decimal.dOne,
    totalClicks: Decimal.dZero
}
export type UpgradeName = keyof typeof defaultData.upgrades
export const UpgradeNames = Object.keys(defaultData.upgrades) as UpgradeName[];