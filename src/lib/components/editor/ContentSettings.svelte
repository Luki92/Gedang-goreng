<script>
	let { data = $bindable({}), onChange = () => {}, sections = [] } = $props();

	/**
	 * @param {string} field
	 * @param {any} value
	 */
	function updateField(field, value) {
		data[field] = value;
		onChange();
	}
</script>

<div class="flex flex-col h-full bg-black/20 border-l border-white/10 overflow-y-auto backdrop-blur-md">
	<div class="sticky top-0 px-4 py-3 border-b border-white/10 bg-white/5 backdrop-blur-xl z-10">
		<h3 class="text-sm font-semibold text-white/80">Settings</h3>
	</div>

	<div class="flex-1 overflow-y-auto p-4 space-y-6">
		{#each sections as section}
			{#if section.fields && section.fields.length > 0}
				<div class="editor-section">
					{#if section.title}
						<h4 class="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">{section.title}</h4>
					{/if}
					<div class="space-y-3">
						{#each section.fields as field}
							{#if field.type === 'text'}
								<div>
									<label class="editor-label">{field.label}</label>
									<input
										type="text"
										value={data[field.key] || ''}
										onchange={(e) => updateField(field.key, e.currentTarget.value)}
										onblur={(e) => updateField(field.key, e.currentTarget.value)}
										class="editor-input"
										placeholder={field.placeholder || ''}
									/>
								</div>
							{:else if field.type === 'textarea'}
								<div>
									<label class="editor-label">{field.label}</label>
									<textarea
										value={data[field.key] || ''}
										onchange={(e) => updateField(field.key, e.currentTarget.value)}
										onblur={(e) => updateField(field.key, e.currentTarget.value)}
										class="editor-textarea"
										rows={field.rows || 3}
										placeholder={field.placeholder || ''}
									></textarea>
								</div>
							{:else if field.type === 'select'}
								<div>
									<label class="editor-label">{field.label}</label>
									<select
										value={data[field.key] || ''}
										onchange={(e) => updateField(field.key, e.currentTarget.value)}
										class="editor-input"
									>
										{#each field.options || [] as option}
											<option value={option.value} class="bg-[#111]">{option.label}</option>
										{/each}
									</select>
								</div>
							{:else if field.type === 'checkbox'}
								<label class="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors">
									<input
										type="checkbox"
										checked={data[field.key] || false}
										onchange={(e) => updateField(field.key, e.currentTarget.checked)}
										class="rounded border-white/20 bg-black/20 text-blue-500 focus:ring-blue-500"
									/>
									<span class="text-sm text-white/70 font-medium">{field.label}</span>
								</label>
							{:else if field.type === 'number'}
								<div>
									<label class="editor-label">{field.label}</label>
									<input
										type="number"
										value={data[field.key] || 0}
										onchange={(e) => updateField(field.key, parseFloat(e.currentTarget.value))}
										onblur={(e) => updateField(field.key, parseFloat(e.currentTarget.value))}
										class="editor-input"
										placeholder={field.placeholder || ''}
									/>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{/if}
		{/each}
	</div>

	<slot />
</div>
