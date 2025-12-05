import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Plug } from 'lucide-react';

interface AssignedPortsCardProps {
  assignedPorts: string | null;
}

export function AssignedPortsCard({ assignedPorts }: AssignedPortsCardProps) {
  const { t } = useTranslation('tasks');
  const [isExpanded, setIsExpanded] = useState(false);

  if (!assignedPorts) {
    return null;
  }

  // Parse the ports JSON
  let ports: Record<string, number> = {};
  try {
    ports = JSON.parse(assignedPorts);
  } catch {
    return null;
  }

  const portEntries = Object.entries(ports);
  if (portEntries.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-lg bg-muted/20 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
          <Plug className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm">
            {t('assignedPorts.cardTitle')}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('assignedPorts.cardSubtitle', { count: portEntries.length })}
          </p>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="rounded-md border bg-background p-3 font-mono text-sm">
            {portEntries.map(([key, value]) => (
              <div key={key} className="flex justify-between py-1">
                <span className="text-muted-foreground">{key}</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t('assignedPorts.cardHint')}
          </p>
        </div>
      )}
    </div>
  );
}
