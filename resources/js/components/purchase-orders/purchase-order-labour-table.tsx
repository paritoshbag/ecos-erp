import { formatMoney } from '@/components/purchase-orders/format';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { PurchaseOrderLabourLine } from '@/types/purchase-order';

function formatQuantity(value: string): string {
    return Number(value).toLocaleString('en-IN', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    });
}

export function PurchaseOrderLabourTable({
    lines,
}: {
    lines: PurchaseOrderLabourLine[];
}) {
    if (lines.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No labour rows were found in this PDF.
            </p>
        );
    }

    const showMaster = lines.some((line) => line.in_master !== undefined);

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-12">Sl</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>HSN/SAC</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>UoM</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">F&amp;I</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    {showMaster ? <TableHead>Master</TableHead> : null}
                </TableRow>
            </TableHeader>
            <TableBody>
                {lines.map((line) => (
                    <TableRow key={line.line_no}>
                        <TableCell className="text-muted-foreground tabular-nums">
                            {line.line_no}
                        </TableCell>
                        <TableCell className="max-w-xs whitespace-normal">
                            {line.description}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            {line.hsn_sac ?? '—'}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                            {formatQuantity(line.quantity)}
                        </TableCell>
                        <TableCell>{line.unit}</TableCell>
                        <TableCell className="text-right tabular-nums">
                            {formatMoney(line.rate)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                            {formatMoney(line.freight_and_insurance)}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                            {formatMoney(line.amount)}
                        </TableCell>
                        {showMaster ? (
                            <TableCell>
                                {line.in_master ? (
                                    <div className="flex max-w-48 flex-col gap-1">
                                        <Badge variant="secondary">
                                            In master
                                        </Badge>
                                        {line.master_description ? (
                                            <span className="text-xs whitespace-normal text-muted-foreground">
                                                {line.master_description}
                                            </span>
                                        ) : null}
                                    </div>
                                ) : (
                                    <Badge variant="outline">Will add</Badge>
                                )}
                            </TableCell>
                        ) : null}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
