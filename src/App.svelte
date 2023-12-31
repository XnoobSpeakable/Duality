<script lang="ts">
	import "./app.css";
	import Decimal from "break_eternity.js";
    import { defaultData, type Data } from "./export";

	const format = {
		decimalPlaces: function (
			value: number,
			places: number,
			trunc = (x: number) => x,
		): number {
			const length = places + 1;
			const digitsCount = Math.ceil(Math.log10(Math.abs(value)));
			const rounded =
				Math.round(value * 10 ** (length - digitsCount)) *
				10 ** (digitsCount - length);
			return trunc(
				Number(rounded.toFixed(Math.max(length - digitsCount, 0))),
			);
		},
		decimal: function (d: Decimal, places = 3, ePlaces = 99): string {
			if (d.layer === 0) {
				if ((d.mag < 1e4 && d.mag > 1e-7) || d.mag === 0) {
					return (d.sign * d.mag).toFixed(places);
				}
				return `${format.decimalPlaces(
					d.m,
					places,
				)}e${format.decimalPlaces(d.e, ePlaces, Math.round)}`;
			} else if (d.layer === 1) {
				return `${format.decimalPlaces(
					d.m,
					places,
				)}e${format.decimalPlaces(d.e, ePlaces, Math.round)}`;
			} else {
				if (d.layer <= 5) {
					return `${d.sign === -1 ? "-" : ""}${"e".repeat(d.layer)}
                ${format.decimalPlaces(d.mag, ePlaces, Math.round)}`;
				} else {
					return `${d.sign === -1 ? "-" : ""}(e^${
						d.layer
					})${format.decimalPlaces(d.mag, ePlaces, Math.round)}`;
				}
			}
		},
		big: function (n: Decimal): string {
			return n.absLog10().toNumber() >= 6
				? format.decimal(n, 2).replace("e+", "e").replace(".00", "")
				: n.toFixed(0);
		},
	};

	let player: Data = cloneObject(defaultData);

	//#region Saving/Loading

	Decimal.prototype.toJSON = function (): string {
		return "D#" + this.toString();
	};

	/**
	 * A utility function used when deserializing the player object, used to
	 * handle Decimal values.
	 */
	function deserializeDecimal(_key: string, value: unknown): unknown {
		return typeof value === "string" && value.startsWith("D#")
			? new Decimal(value.slice(2))
			: value;
	}

	/**
	 * Recursively merge two objects.
	 * @param source The object to which copy the property values from the
	 * other object.
	 * @param data The object from which to copy property values.
	 */
	function mergeRecursive<T extends object>(source: T, data: T): void {
		for (const key in data) {
			const value = data[key];
			if (
				typeof value === "object" &&
				value !== null &&
				!(value instanceof Decimal)
			) {
				const newSource = source[key];
				if (!(key in source)) {
					// @ts-expect-error uhh how do I convince TS this is fine?
					source[key] = Array.isArray(value) ? [] : {};
				}
				if (typeof newSource === "object" && newSource !== null) {
					mergeRecursive(newSource, value);
				}
			} else source[key] = value;
		}
	}

	/**
	 * Loads the player save from localStorage, if one exists.
	 */
	function load(): void {
		const save = localStorage.getItem(location.pathname);
		if (save === null) return;
		mergeRecursive(
			player,
			JSON.parse(
				save.startsWith("{") ? save : atob(save),
				deserializeDecimal,
			),
		);
	}

	function saveReplace(_key: string, value: unknown): unknown {
		if (value instanceof Decimal) return "D#" + value.toString();
		return value;
	}
	function save() {
		const savefile = btoa(JSON.stringify(player, saveReplace));
		localStorage.setItem(location.pathname, savefile);
	}

	//#endregion

	//#region Upgrades
	type UpgradeName = keyof typeof player.upgrades;
	const UpgradeNames = Object.keys(player.upgrades) as UpgradeName[];

	/**
	 * @returns Whether or not the given value is the name of one of the
	 * upgrades.
	 */
	function isUpgradeName(x: unknown): x is UpgradeName {
		return typeof x === "string" && x in player.upgrades;
	}

	/**
	 * A utility function to get the current cost of an upgrade.
	 * @param upgradeName The name of the upgrade.
	 * @returns The cost of the given upgrade.
	 */
	function getUpgradeCost(upgradeName: UpgradeName): Decimal {
		return player.upgrades[upgradeName].cost;
	}

	/**
	 * A utility function to change the cost of an upgade.
	 * @param upgradeName The name of the upgrade.
	 * @param newCost The new cost of the given upgrade.
	 */
	function setUpgradeCost(upgradeName: UpgradeName, newCost: Decimal): void {
		player.upgrades[upgradeName].cost = newCost;
	}

	/**
	 * A utility function to get the current level of an upgrade.
	 * @param upgradeName The name of the upgrade.
	 * @returns The current level of the given upgrade.
	 */
	function getUpgradeTimesBought(upgradeName: UpgradeName): Decimal {
		return player.upgrades[upgradeName].timesBought;
	}

	interface Upgrade {
		cost: Decimal;
		currency: CurrencyName;
		costDiv: string;
		costFunction?: ((upgradeAmount: Decimal) => Decimal) | null;
		scaleFunction: (upgradeName: UpgradeName) => void;
		extra?: VoidFunction;
		costRounding?: number;
	}

	const upgrades = {
		upgrademult: {
			cost: new Decimal(1024),
			currency: "gold",
			costDiv: "upgrademultcost",
			scaleFunction: scalePower(new Decimal(2)),
		},
	} as const satisfies Record<string, Upgrade>;

	function buyUpgrade(upgradeName: UpgradeName): undefined {
		const upgrade = upgrades[upgradeName];
		const oldCost = getUpgradeCost(upgradeName);

		if (player[upgrade.currency].gte(oldCost)) {
			player.upgrades[upgradeName].timesBought = player.upgrades[
				upgradeName
			].timesBought.plus(Decimal.dOne);
			player[upgrade.currency] = player[upgrade.currency].div(oldCost);
			upgrade.scaleFunction(upgradeName);
		}
	}
	//#endregion

	//#region Utils
	function clearPlayerData() {
		localStorage.clear()
		player = <Data>structuredClone(defaultData)
		location.reload()
	}
	/**
	 * @deprecated use only if required
	 * @param obj
	 */
	function cloneObject(obj: Object) {
		if (null == obj || "object" != typeof obj) return obj;
		var copy = obj.constructor();
		for (var attr in obj) {
			//@ts-expect-error idk why it errors
			if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
		}
		return copy;
	}
	//#endregion

	//#region Pre-initialize

	load();

	const currencyNames = {
		gold: "gold",
	};

	type CurrencyName = keyof typeof currencyNames;

	// upgrade scaling function. After buy, raises costs to a power.
	function scalePower(power: Decimal): (upgradeName: UpgradeName) => void {
		return function (upgradeName: UpgradeName): void {
			setUpgradeCost(upgradeName, getUpgradeCost(upgradeName).pow(power));
		};
	}

	//#endregion

	//#region Initialize

	// console.debug(structuredClone(defaultData), defaultData)

	const lcloop = () => {
		if (player.gold.lessThan(Decimal.dOne)) {
			player.gold = Decimal.dOne
		}
		player.mult = Decimal.dTwo.plus(getUpgradeTimesBought("upgrademult"));
		player.gold = player.gold.times(player.mult);
		// console.log(getUpgradeCost("upgrademult"));
		// console.log(getUpgradeTimesBought("upgrademult"));
	}

	const loops = {
		lcLoop: 0,
		autosaveLoop: 0,
		restartLCLoop: function() {
			clearInterval(this.lcLoop)
			this.lcLoop = setInterval(lcloop, player.time)
		},
		restartAutosaveLoop: function() {
			clearInterval(this.autosaveLoop)
			setInterval(() => {
				save();
			}, 10000);
		}
	}
	loops.restartLCLoop();
	loops.restartAutosaveLoop();
	// we need to restart the loop every time `player.time` changes

	//#endregion
</script>

<!-- we dont need font awesome for now -->
<!-- <svelte:head>
	<script
		src="https://kit.fontawesome.com/e1a323daa1.js"
		crossorigin="anonymous"
	></script>
</svelte:head> -->
<main>
	<section>
		<div id="left">
			<p>{format.big(player.gold)} {currencyNames.gold}</p>

            <div class="upgrade">
                <button on:click={() => {buyUpgrade("upgrademult")}}>
                    increase multiplier
                </button>
                <p>{getUpgradeCost("upgrademult")}</p>
            </div>
			<div  class="upgrade">
                <button on:click={() => {buyUpgrade("upgradetime")}}>
                    decrease multiplication delay
                </button>
                <p>{getUpgradeCost("upgradetime")}</p>
            </div>
		</div>

		<div id="right">
			<p>0 clicks</p>
			<button>click</button>
		</div>
	</section>
</main>
<button on:click={clearPlayerData}>Clear data</button>
