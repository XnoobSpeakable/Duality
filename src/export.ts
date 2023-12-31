import Decimal from "break_eternity.js";

export interface Data {
    upgrades: {
        upgrademult: {
            cost: Decimal,
            timesBought: Decimal,
        },
    },
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
    },
    mult: Decimal.dTwo,
    gold: Decimal.dOne,
    time: 1000,
    settings: {} // TODO: add settings page
}