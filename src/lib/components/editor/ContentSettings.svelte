<script>
	/** @type {{ data: any, sections: any[], onChange: () => void }} */
	let { data = $bindable(), sections, onChange } = $props();

	// Generate a unique ID for this instance to avoid label/input ID conflicts
	const instanceId = Math.random().toString(36).substring(2, 9);
</script>

<div class="w-80 border-l border-white/10 bg-black/40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right duration-300">
	<div class="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
		<h3 class="text-xs font-mono font-bold text-white/60 tracking-widest uppercase">Content_Settings</h3>
	</div>

	<div class="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
		{#each sections as section}
			<div class="space-y-4">
				<h4 class="text-[10px] font-mono text-blue-400 uppercase tracking-[0.2em] border-b border-blue-500/20 pb-1">
					{section.title}
				</h4>

				<div class="space-y-4">
					{#each section.fields as field}
						<div class="space-y-1">
							{#if field.type === 'checkbox'}
								<label class="flex items-center gap-2 cursor-pointer group">
									<input
										type="checkbox"
										bind:checked={data[field.key]}
										onchange={onChange}
										class="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0 transition-all"
									/>
									<span class="text-xs text-white/60 group-hover:text-white transition-colors">{field.label}</span>
								</label>
							{:else}
								<div>
									<label class="editor-label" for="field-{instanceId}-{field.key}">{field.label}</label>
									{#if field.type === 'textarea'}
										<textarea
											id="field-{instanceId}-{field.key}"
											bind:value={data[field.key]}
											class="editor-textarea"
											rows="3"
											onchange={onChange}
										></textarea>
									{:else if field.type === 'select'}
										<select
											id="field-{instanceId}-{field.key}"
											bind:value={data[field.key]}
											class="editor-input"
											onchange={onChange}
										>
											{#each field.options as opt}
												<option value={opt.value}>{opt.label}</option>
											{/each}
										</select>
									{:else}
										<input
											id="field-{instanceId}-{field.key}"
											type={field.type}
											bind:value={data[field.key]}
											class="editor-input"
											placeholder={field.placeholder || ''}
											onchange={onChange}
										/>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<div class="p-4 border-t border-white/10 bg-black/40 text-[9px] font-mono text-white/20">
		UUID: {data.id || 'NEW_ENTITY'}
	</div>
</div>
