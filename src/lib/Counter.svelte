<script lang="ts">
    // hey dont ignore me >:(
    let count: number = 0;
    const increment = () => {
        count += 1;
    };
</script>

<button on:click={increment}>
    count is {count}
</button>
