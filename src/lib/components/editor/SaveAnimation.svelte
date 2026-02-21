<script>
	import { onMount } from 'svelte';

	let { isVisible = false, isSuccess = false, message = '', sqlCommands = [] } = $props();
	let /** @type {string[]} */ displayedCommands = $state([]);
	let displayedMessage = $state('');
	let commandIndex = $state(0);

	onMount(() => {
		if (isVisible) {
			commandIndex = 0;
			displayedCommands = [];
			displayedMessage = '';

			const commandInterval = setInterval(() => {
				if (commandIndex < sqlCommands.length) {
					displayedCommands = [...displayedCommands, sqlCommands[commandIndex]];
					commandIndex++;
				} else {
					clearInterval(commandInterval);
					setTimeout(() => {
						displayedMessage = message;
					}, 300);
				}
			}, 150);

			return () => clearInterval(commandInterval);
		}
	});
</script>

{#if isVisible}
	<div class="fixed inset-0 pointer-events-none flex items-center justify-center">
		<div
			class="pointer-events-auto bg-black border border-gray-700 rounded-lg shadow-2xl max-w-2xl w-11/12 overflow-hidden"
			style="animation: slideUp 0.3s ease-out"
		>
			<!-- Terminal Header -->
			<div class="bg-gray-900 px-4 py-2 border-b border-gray-700 flex items-center gap-2">
				<div class="flex gap-1">
					<div class="w-3 h-3 rounded-full bg-red-500"></div>
					<div class="w-3 h-3 rounded-full bg-yellow-500"></div>
					<div class="w-3 h-3 rounded-full bg-green-500"></div>
				</div>
				<span class="text-xs text-gray-500 font-mono ml-2">database sync</span>
			</div>

			<!-- Terminal Content -->
			<div class="p-4 bg-black font-mono text-sm max-h-72 overflow-y-auto">
				{#each displayedCommands as cmd}
					<div class="text-green-400 mb-2" style="animation: fadeIn 0.3s ease-out">
						<span class="text-gray-600">$ </span>{cmd}
					</div>
				{/each}

				{#if displayedMessage}
					<div class="mt-4 pt-2 border-t border-gray-700" style="animation: fadeIn 0.3s ease-out">
						<div
							class="text-sm font-semibold {isSuccess
								? 'text-green-400'
								: 'text-red-400'}"
						>
							{#if isSuccess}
								<span class="text-green-500">✓</span>
							{:else}
								<span class="text-red-500">✗</span>
							{/if}
							{message}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes slideUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
