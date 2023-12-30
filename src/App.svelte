<svelte:head>
    <script src="https://kit.fontawesome.com/e1a323daa1.js" crossorigin="anonymous"></script>
</svelte:head>
<script lang="ts">
    import './app.css';
    import Decimal from 'break_eternity.js'

    const format = {
        decimalPlaces: function(
            value: number,
            places: number,
            trunc = (x: number) => x
        ): number {
            const length = places + 1;
            const digitsCount = Math.ceil(Math.log10(Math.abs(value)));
            const rounded =
                Math.round(value * 10 ** (length - digitsCount)) *
                10 ** (digitsCount - length);
            return trunc(Number(rounded.toFixed(Math.max(length - digitsCount, 0))));
        },
        decimal: function(d: Decimal, places = 3, ePlaces = 99): string {
            if (d.layer === 0) {
                if ((d.mag < 1e4 && d.mag > 1e-7) || d.mag === 0) {
                    return (d.sign * d.mag).toFixed(places);
                }
                return `${format.decimalPlaces(d.m, places)}e${format.decimalPlaces(
                    d.e,
                    ePlaces,
                    Math.round
                )}`;
            } else if (d.layer === 1) {
                return `${format.decimalPlaces(d.m, places)}e${format.decimalPlaces(
                    d.e,
                    ePlaces,
                    Math.round
                )}`;
            } else {
                if (d.layer <= 5) {
                    return `${d.sign === -1 ? "-" : ""}${"e".repeat(d.layer)}
                ${format.decimalPlaces(d.mag, ePlaces, Math.round)}`;
                } else {
                    return `${d.sign === -1 ? "-" : ""}(e^${d.layer})${format.decimalPlaces(
                        d.mag,
                        ePlaces,
                        Math.round
                    )}`;
                }
            }
        },
        big: function(n: Decimal): string {
            return n.absLog10().toNumber() >= 6
                ? format.decimal(n, 2).replace("e+", "e").replace(".00", "")
                : n.toFixed(0);
        }
    }    

    let player = {
        mult: Decimal.dTwo,
        counter: Decimal.dOne,
        time: 1000
    } 

    Decimal.prototype.toJSON = function (): string {
        return "D#" + this.toString();
    };

    /**
     * A utility function used when deserializing the player object, used to
     * handle Decimal values.
     */
    function saveRevive(_key: string, value: unknown): unknown {
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
    function deepMerge<T extends object>(source: T, data: T): void {
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
                    deepMerge(newSource, value);
                }
            } else source[key] = value;
        }
    }

    /**
     * Loads the player save from localStorage, if one exists.
     */
    export function load(): void {
        const save = localStorage.getItem(location.pathname);
        if (save === null) return;
        deepMerge(
            player,
            JSON.parse(save.startsWith("{") ? save : atob(save), saveRevive)
        );
    }

    load()

    function upgradeMult() {
        player.mult = player.mult.plus(1)
    }
    // left currency loop
    setInterval(() => {
        player.counter = player.counter.times(player.mult)
    }, player.time);


    function saveReplace(_key: string, value: unknown): unknown {
    if (value instanceof Decimal) return "D#" + value.toString();
    return value;
}
    function save() {
    const savefile = btoa(JSON.stringify(player, saveReplace));
    localStorage.setItem(location.pathname, savefile);
}

    //autosaving loop
    setInterval(() => {
        save()
    }, 1000);
</script>
<main>


    <div style="display: flex; flex-direction: row; justify-content:space-around;gap:200px">
        <div id="left">
            <div>{format.big(player.counter)}</div>
            <button on:click={upgradeMult}>increase multiplier</button>

        </div>
        <div id="right">
            <div>0 clicks</div>
            <button>click</button>
        </div>
    </div>
</main>