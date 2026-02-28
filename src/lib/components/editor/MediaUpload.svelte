<script>
    /** @type {{ onUpload: (url: string) => void, onClose: () => void }} */
    let { onUpload, onClose } = $props();

    let isDragging = $state(false);
    let url = $state('');

    /** @param {File} file */
    function handleFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') {
                onUpload(result);
                onClose();
            }
        };
        reader.readAsDataURL(file);
    }

    /** @param {DragEvent} e */
    function onDrop(e) {
        e.preventDefault();
        isDragging = false;
        if (e.dataTransfer?.files) {
            handleFile(e.dataTransfer.files[0]);
        }
    }

    /** @param {Event} e */
    function onSelect(e) {
        const target = /** @type {HTMLInputElement} */ (e.target);
        if (target.files) {
            handleFile(target.files[0]);
        }
    }

    function submitUrl() {
        if (url) {
            onUpload(url);
            onClose();
        }
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    onclick={onClose}
>
    <div
        class="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-pop-in"
        onclick={e => e.stopPropagation()}
    >
        <div class="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 class="text-white font-bold tracking-widest uppercase text-sm">Upload_Media</h3>
            <button type="button" onclick={onClose} class="text-gray-500 hover:text-white transition-colors"><i class="ph-fill ph-x"></i></button>
        </div>

        <div class="p-8 space-y-8">
            <label
                class="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl transition-all cursor-pointer group
                {isDragging ? 'border-blue-500 bg-blue-500/5 scale-95' : 'border-white/10 hover:border-white/30 bg-white/5'}"
                ondragover={e => { e.preventDefault(); isDragging = true; }}
                ondragleave={() => isDragging = false}
                ondrop={onDrop}
            >
                <input type="file" class="hidden" accept="image/*,video/*" onchange={onSelect} />
                <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <i class="ph-fill ph-group-hover:text-blue-400"></i>
                </div>
                <span class="text-xs font-mono text-gray-500 group-hover:text-gray-300">DRAG_DROP_FILE</span>
                <span class="text-[9px] text-gray-600 mt-1">or click to browse</span>
            </label>

            <div class="relative flex items-center">
                <div class="flex-1 h-px bg-white/5"></div>
                <span class="px-4 text-[9px] text-gray-600 font-mono">OR_USE_URL</span>
                <div class="flex-1 h-px bg-white/5"></div>
            </div>

            <div class="flex gap-2">
                <input
                    bind:value={url}
                    placeholder="https://example.com/media.png"
                    class="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs text-white outline-none focus:border-blue-500 transition-colors"
                    onkeydown={e => e.key === 'Enter' && submitUrl()}
                />
                <button
                    type="button"
                    onclick={submitUrl}
                    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
                >
                    ADD
                </button>
            </div>
        </div>
    </div>
</div>

<style>
    @keyframes pop-in {
        from { opacity: 0; transform: scale(0.9) translateY(20px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-pop-in { animation: pop-in 0.3s cubic-bezier(0.23, 1, 0.32, 1); }
</style>
