import { ObjectEntry } from 'utils/types';
import { Usage } from '../../model';
import { cn } from 'utils/cn';

export type UsageListProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLUListElement>,
  HTMLUListElement
> & {
  usage: Usage;
};

export function UsageList(props: UsageListProps) {
  const { usage, className, ...rest } = props;
  return (
    <div className={cn(className, 'relative')}>
      <div className="absolute inset-0 rounded border border-description opacity-40" />
      <ul className="m-1 flex flex-col gap-1 px-1 py-2 text-description opacity-80" {...rest}>
        {(Object.entries(usage) as ObjectEntry<Usage>[]).map(renderUsagePart)}
      </ul>
    </div>
  );
}

export type UsageEntryProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLLIElement>,
  HTMLLIElement
> & {
  codiconId: string;
};

function UsageEntry(props: UsageEntryProps) {
  const { className, children, codiconId, ...rest } = props;
  return (
    <li className={cn(className, 'flex items-start gap-1')} {...rest}>
      <span aria-hidden className={`codicon translate-y-px codicon-${codiconId} opacity-85`} />
      {children}
    </li>
  );
}

function renderUsagePart(entry: ObjectEntry<Usage>) {
  const [key, value] = entry;
  switch (key) {
    case 'outputTokens':
      return (
        <UsageEntry key={key} codiconId="arrow-down">
          {formatNumber(value)} <span className="sr-ony">tokens</span> output
        </UsageEntry>
      );
    case 'inputTokens':
      return (
        <UsageEntry key={key} codiconId="arrow-up">
          {formatNumber(value)} <span className="sr-ony">tokens</span> input
        </UsageEntry>
      );
    case 'cacheReads':
      return (
        <UsageEntry key={key} codiconId="dashboard">
          {formatNumber(value)} <span className="sr-ony">tokens in</span> cache reads
        </UsageEntry>
      );
    case 'cacheWrites':
      return (
        <UsageEntry key={key} codiconId="database">
          {formatNumber(value)} <span className="sr-ony">tokens in</span> cache writes
        </UsageEntry>
      );
    default:
      return '';
  }
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) {
    return (n / 1_000_000_000).toFixed(1) + 'B';
  } else if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1) + 'M';
  } else if (n >= 1_000) {
    return (n / 1_000).toFixed(1) + 'K';
  } else {
    return n.toString();
  }
}
