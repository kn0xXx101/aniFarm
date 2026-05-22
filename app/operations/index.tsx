import { OperationsScreen } from '@/components/operations/operations-screen';
import { ModuleGrid } from '@/components/operations/module-grid';
import { SectionHeading } from '@/components/neo3d/section-heading';
import { FARM_MODULES } from '@/lib/operations/modules';

export default function OperationsHub() {
  return (
    <OperationsScreen
      title="Farm operations"
      subtitle="Registry, health, feed, tasks & sales"
      requireFarm={false}
      showFarmSelector
    >
      <SectionHeading
        eyebrow="Modules"
        title="Manage your farm"
        description="Tap a module to open animals, health, feed, tasks, sales, vet, and security."
      />
      <ModuleGrid modules={FARM_MODULES} columns={1} />
    </OperationsScreen>
  );
}
