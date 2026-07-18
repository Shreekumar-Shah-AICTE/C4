'use client';

import { useState, type FormEvent, type ReactElement } from 'react';

import { ApiError, uploadDataset, type DatasetSummary } from '@/lib/api';

interface UploadPanelProps {
  readonly onUploaded: (summary: DatasetSummary) => void;
}

interface Status {
  readonly tone: 'success' | 'error';
  readonly message: string;
}

/** Upload panel letting operators register their own crowd CSV/JSON feed. */
export function UploadPanel({ onUploaded }: UploadPanelProps): ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState('');
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (file === null) {
      setStatus({ tone: 'error', message: 'Choose a CSV or JSON file first.' });
      return;
    }
    setBusy(true);
    try {
      const format = file.name.toLowerCase().endsWith('.json') ? 'json' : 'csv';
      const summary = await uploadDataset(await file.text(), format, label);
      onUploaded(summary);
      setStatus({
        tone: 'success',
        message: `Loaded "${summary.label}" (${summary.sampleCount} samples).`,
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Upload failed.';
      setStatus({ tone: 'error', message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="panel"
      aria-labelledby="upload-heading"
      onSubmit={(event) => {
        void submit(event);
      }}
    >
      <h2 id="upload-heading">Upload crowd data</h2>
      <p className="hint">
        Provide synthetic crowd density as CSV (<code>from,to,minute,density</code>) or JSON to
        exercise routing and the narrator on your own numbers.
      </p>
      <div className="field">
        <label htmlFor="dataset-label">Dataset name</label>
        <input
          id="dataset-label"
          type="text"
          value={label}
          placeholder="e.g. Semi-final evening rush"
          onChange={(event) => {
            setLabel(event.target.value);
          }}
        />
      </div>
      <div className="field">
        <label htmlFor="dataset-file">Crowd file</label>
        <input
          id="dataset-file"
          type="file"
          accept=".csv,.json,text/csv,application/json"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
          }}
        />
      </div>
      <button className="btn" type="submit" disabled={busy}>
        Upload dataset
      </button>
      {status !== null ? (
        <p className="status" data-tone={status.tone} role="status">
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
