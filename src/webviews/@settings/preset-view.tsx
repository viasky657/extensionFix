import { z } from 'zod';
import * as React from 'react';
import { ANTHROPIC_MODELS, NewPreset, PermissionState, Preset, Provider, View } from '../../model';
import { PresetForm } from './form';
import { usePresets } from './use-preset';
import { processFormData } from 'utils/form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from 'components/button';

export function PresetView() {
	const presets = usePresets();
	const { presetId } = useParams();
	const navigate = useNavigate();

	let preset: Preset | undefined;
	if (presetId) {
		preset = presets.data?.presets.get(presetId);
	}

	const stableId = React.useId();

	function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		try {
			const result = parsePresetFormData(new FormData(form));
			if (result.type === 'preset') {
				presets.updatePreset(result);
			} else if (result.type === 'new-preset') {
				presets.addPreset(result);
			}
			navigate(`/${View.Settings}`);
		} catch (err) {
			console.error(err);
		}
	}

	function onDeletePreset() {
		if (preset) {
			presets.deletePreset(preset.id);
			navigate(`/${View.Settings}`);
		}
	}

	return (
		<main className="flex flex-grow flex-col gap-2 p-2">
			<header className="mb-2">
				<h2 className="text-base text-description">{preset?.name || 'New preset'}</h2>
			</header>
			<PresetForm formId={stableId} onSubmit={onSubmit} initialData={preset} />
			<div className="flex justify-end gap-2">
				<Button variant="secondary" asChild>
					<Link to={`/${View.Settings}`}>Cancel</Link>
				</Button>
				<Button type="submit" variant="primary" form={stableId}>
					Save
				</Button>
			</div>
			<div className="flex justify-end gap-2">
				<Button type="button" onClick={onDeletePreset}>
					Delete preset
				</Button>
			</div>
		</main>
	);
}

// First, let's create enum schemas
const ProviderSchema = z.enum([
	Provider.Anthropic,
	Provider.OpenAI,
	Provider.OpenRouter,
	Provider.GoogleGemini,
	Provider.AWSBedrock,
	Provider.OpenAICompatible,
	Provider.Ollama,
]);

const ModelSchema = z.enum(ANTHROPIC_MODELS);

const PermissionStateSchema = z.enum([PermissionState.Always, PermissionState.Ask]);

// Permissions schema
const PermissionsSchema = z.record(z.string(), PermissionStateSchema);

// Base preset schema with common fields
const BasePresetSchema = z.object({
	provider: ProviderSchema,
	model: ModelSchema,
	apiKey: z.string(),
	customBaseUrl: z.string().optional(),
	permissions: PermissionsSchema,
	customInstructions: z.string(),
	name: z.string(),
});

// NewPreset schema (without id and createdOn)
export const NewPresetSchema = BasePresetSchema;

// Full Preset schema (with id and createdOn)
export const PresetSchema = BasePresetSchema.extend({
	id: z.string(),
	//createdOn: z.string(),
});

function parsePresetFormData(formData: FormData) {
	// Check if we have an ID field to determine if it's a new preset or existing preset
	const hasId = formData.has('id');
	const processed = processFormData(formData);
	console.log({ processed });

	// TODO (@g-danna) make sure we don't need to cast
	if (hasId) {
		return { type: 'preset', ...PresetSchema.parse(processed) } as Preset;
	} else {
		return { type: 'new-preset', ...NewPresetSchema.parse(processed) } as NewPreset;
	}
}

