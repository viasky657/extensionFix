import * as React from 'react';
import { Event, NewPreset, Preset } from '../../model';
import { LoaderFunctionArgs } from 'react-router-dom';

export enum Status {
	Idle = 'idle',
	Loading = 'loading',
	Success = 'success',
	Error = 'error',
}

type AsyncState<T> =
	| { status: Status.Idle; data: undefined }
	| { status: Status.Loading; data: undefined }
	| { status: Status.Success; data: T }
	| { status: Status.Error; data: undefined };

function getPresets() {
	vscode.postMessage({
		type: 'get-presets',
	});
}

function loadPresets({ params }: LoaderFunctionArgs) {
	return new Promise<{ presets: Map<string, Preset>; activePresetId?: string }>((resolve) => {
		const handleMessage = (event: MessageEvent<Event>) => {
			if (event.data.type === 'presets-loaded') {
				const { presets: presetsTuples, activePresetId } = event.data;
				const presetsMap = new Map<string, Preset>();
				presetsTuples.forEach(([presetId, preset]) => {
					presetsMap.set(presetId, preset);
				});
				resolve({ presets: presetsMap, activePresetId });
				window.removeEventListener('message', handleMessage);
			}
		};
		window.addEventListener('message', handleMessage);

		vscode.postMessage({
			type: 'get-presets',
		});
	});
}

export function usePresets() {
	const [state, setState] = React.useState<
		AsyncState<{ presets: Map<string, Preset>; activePresetId?: string }>
	>({ status: Status.Idle, data: undefined });

	React.useEffect(() => {
		const handleMessage = (event: MessageEvent<Event>) => {
			if (event.data.type === 'presets-loaded') {
				const { presets: presetsTuples, activePresetId } = event.data;
				const presetsMap = new Map<string, Preset>();
				presetsTuples.forEach(([presetId, preset]) => {
					presetsMap.set(presetId, preset);
				});
				setState({ status: Status.Success, data: { presets: presetsMap, activePresetId } });
			}
		};
		window.addEventListener('message', handleMessage);
		return () => {
			window.removeEventListener('message', handleMessage);
		};
	}, []);

	React.useEffect(() => {
		setState({ data: undefined, status: Status.Loading });
		getPresets();
	}, []);

	function addPreset(preset: NewPreset) {
		vscode.postMessage({
			type: 'add-preset',
			preset,
		});
		getPresets();
	}

	function updatePreset(preset: Preset) {
		vscode.postMessage({
			type: 'update-preset',
			preset,
		});
		getPresets();
	}

	function deletePreset(presetId: string) {
		vscode.postMessage({
			type: 'delete-preset',
			presetId,
		});
		getPresets();
	}

	function setActivePreset(presetId: string) {
		vscode.postMessage({
			type: 'set-active-preset',
			presetId,
		});
		getPresets();
	}

	return Object.assign(state, { addPreset, updatePreset, deletePreset, setActivePreset });
}

