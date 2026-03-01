<script>
    let { text, tip } = $props();
    let show = $state(false);
    let x = $state(0);
    let y = $state(0);

    /** @param {MouseEvent} e */
    function onEnter(e) {
        show = true;
        updatePos(e);
    }

    /** @param {MouseEvent} e */
    function onMove(e) {
        updatePos(e);
    }

    /** @param {MouseEvent} e */
    function updatePos(e) {
        x = e.clientX + 10;
        y = e.clientY + 10;
    }
</script>

<span
    class="border-b border-dotted border-gray-500 cursor-help hover:text-white hover:border-white transition-colors relative inline-block"
    onmouseenter={onEnter}
    onmousemove={onMove}
    onmouseleave={() => show = false}
    role="button"
    tabindex="0"
>
    {text}
</span>

{#if show}
    <div
        class="fixed z-[9999] bg-black border border-gray-600 text-gray-300 text-[10px] px-3 py-2 rounded shadow-2xl pointer-events-none max-w-[200px] leading-tight"
        style="top: {y}px; left: {x}px;"
    >
        {tip}
    </div>
{/if}
