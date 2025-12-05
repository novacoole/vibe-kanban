import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { attemptsApi } from '@/lib/api';
import { defineModal } from '@/lib/modals';
import { Unplug } from 'lucide-react';

interface AssignedPortsDialogProps {
  attemptId: string;
  assignedPorts: string | null;
  onPortsReleased?: () => void;
}

const AssignedPortsDialogImpl = NiceModal.create<AssignedPortsDialogProps>(
  ({ attemptId, assignedPorts, onPortsReleased }) => {
    const { t } = useTranslation('tasks');
    const modal = useModal();
    const [isReleasing, setIsReleasing] = useState(false);

    // Parse the ports JSON
    const ports: Record<string, number> = assignedPorts
      ? JSON.parse(assignedPorts)
      : {};
    const portEntries = Object.entries(ports);
    const hasNoPorts = portEntries.length === 0;

    const handleReleasePorts = async () => {
      setIsReleasing(true);
      try {
        await attemptsApi.releasePorts(attemptId);
        onPortsReleased?.();
        modal.hide();
      } catch (error) {
        console.error('Failed to release ports:', error);
      } finally {
        setIsReleasing(false);
      }
    };

    return (
      <Dialog open={modal.visible} onOpenChange={(open) => !open && modal.hide()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('assignedPorts.title')}</DialogTitle>
            <DialogDescription>
              {hasNoPorts
                ? t('assignedPorts.noPortsDescription')
                : t('assignedPorts.description')}
            </DialogDescription>
          </DialogHeader>

          {!hasNoPorts && (
            <div className="py-4">
              <div className="rounded-md border bg-muted/30 p-3 font-mono text-sm">
                {portEntries.map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => modal.hide()}>
              {t('common:buttons.close')}
            </Button>
            {!hasNoPorts && (
              <Button
                variant="destructive"
                onClick={handleReleasePorts}
                disabled={isReleasing}
              >
                <Unplug className="h-4 w-4 mr-2" />
                {isReleasing
                  ? t('assignedPorts.releasing')
                  : t('assignedPorts.releasePorts')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

export const AssignedPortsDialog = defineModal<
  AssignedPortsDialogProps,
  void
>(AssignedPortsDialogImpl);
