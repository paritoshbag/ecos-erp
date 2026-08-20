import { StatusBadge } from '@/components/template/status-badge';

export function NoMaterialChip() {
    return (
        <StatusBadge variant="warning" withDot={false}>
            No Material Uploaded
        </StatusBadge>
    );
}
