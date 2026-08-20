<?php

namespace Tests\Unit;

use App\Services\PurchaseOrder\PurchaseOrderPdfParser;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PurchaseOrderPdfParserTest extends TestCase
{
    public function test_it_extracts_a_maintenance_po_with_order_number(): void
    {
        $parsed = (new PurchaseOrderPdfParser)->parsePath(
            $this->fixture('5101100982 - PO (SYS).pdf'),
        );

        $this->assertSame('DM/KLD/2025-26/PO-MAINT/274', $parsed['memo_number']);
        $this->assertNull($parsed['memo_date']);
        $this->assertSame('5101100982', $parsed['po_number']);
        $this->assertSame('2026-03-30', $parsed['po_date']);
        $this->assertNull($parsed['project_id']);
        $this->assertSame('20301869', $parsed['order_no']);
        $this->assertSame('627521', $parsed['reference_no']);
        $this->assertSame(51, $parsed['order_type']);
        $this->assertSame('KALNA', $parsed['ccc']);
        $this->assertNotNull($parsed['description']);
        $this->assertStringContainsString('Breakdown & Maintenance', $parsed['description']);
        $this->assertSame('49486.00', $parsed['po_amount']);
        $this->assertSame(64, strlen($parsed['pdf_hash']));
        $this->assertCount(14, $parsed['lines']);
        $this->assertSame('ERRECTION OF 8 M PCC SP WITHOUT FITNG', $parsed['lines'][0]['description']);
        $this->assertSame('9.000', $parsed['lines'][0]['quantity']);
        $this->assertSame('NOS', $parsed['lines'][0]['unit']);
        $this->assertSame('1501.00', $parsed['lines'][0]['rate']);
        $this->assertSame('13509.00', $parsed['lines'][0]['amount']);
        $this->assertSame('0.00', $parsed['lines'][0]['freight_and_insurance']);
        $this->assertNull($parsed['lines'][0]['hsn_sac']);
        $this->assertSame('EARTHING COMPLETE', $parsed['lines'][2]['description']);
        $this->assertSame('STRAIGHTENING OF 8 M PCC POLE', $parsed['lines'][13]['description']);
    }

    public function test_it_extracts_a_capex_po_with_project_id(): void
    {
        $parsed = (new PurchaseOrderPdfParser)->parsePath(
            $this->fixture('5301086659 - PO (SYS).pdf'),
        );

        $this->assertSame('DM/KLD/2025-2026/PO-CAPEX/KALNA-254', $parsed['memo_number']);
        $this->assertSame('5301086659', $parsed['po_number']);
        $this->assertSame('2026-03-12', $parsed['po_date']);
        $this->assertSame('ALT/WS/AB/25/0383', $parsed['project_id']);
        $this->assertSame('ALT/WS/AB/25/0383', $parsed['reference_no']);
        $this->assertNull($parsed['order_no']);
        $this->assertSame(53, $parsed['order_type']);
        $this->assertSame('BDP', $parsed['ccc']);
        $this->assertSame('27799.92', $parsed['po_amount']);
        $this->assertStringContainsString('SYSTEM IMPROVEMENT', (string) $parsed['description']);
        $this->assertCount(16, $parsed['lines']);
        $this->assertSame('GIS SURVEY PER POLE OR ITEM', $parsed['lines'][0]['description']);
        $this->assertSame('STRINGING LT AB CABLE,3X70+1X16+1X50', $parsed['lines'][6]['description']);
    }

    /**
     * @param  array<string, mixed>  $expected
     */
    #[DataProvider('samplePurchaseOrders')]
    public function test_it_extracts_fields_from_sample_purchase_orders(string $filename, array $expected): void
    {
        $path = $this->samplePath($filename);

        if ($path === null) {
            $this->markTestSkipped('Sample PDF not present: '.$filename);
        }

        $parsed = (new PurchaseOrderPdfParser)->parsePath($path);

        foreach ($expected as $key => $value) {
            $this->assertSame($value, $parsed[$key], $filename.' '.$key);
        }
    }

    public function test_it_joins_a_description_split_across_pages(): void
    {
        $path = $this->samplePath('5301103405 - PO (SYS).pdf');

        if ($path === null) {
            $this->markTestSkipped('Sample PDF not present: 5301103405 - PO (SYS).pdf');
        }

        $parsed = (new PurchaseOrderPdfParser)->parsePath($path);

        $this->assertCount(12, $parsed['lines']);
        $this->assertSame('ERRECTION OF D.B ON POLE WITH STRAP-BUCL', $parsed['lines'][6]['description']);
        $this->assertSame('2.000', $parsed['lines'][6]['quantity']);
        $this->assertSame('507.00', $parsed['lines'][6]['rate']);
    }

    /**
     * @return array<string, array{0: string, 1: array<string, mixed>}>
     */
    public static function samplePurchaseOrders(): array
    {
        return [
            'maint kalna' => ['5101100982 - PO (SYS).pdf', [
                'po_number' => '5101100982',
                'po_date' => '2026-03-30',
                'order_no' => '20301869',
                'reference_no' => '627521',
                'order_type' => 51,
                'ccc' => 'KALNA',
                'po_amount' => '49486.00',
                'project_id' => null,
                'memo_date' => null,
            ]],
            'dcrc kalna' => ['5101111899 - PO (SYS).pdf', [
                'po_number' => '5101111899',
                'po_date' => '2026-05-11',
                'order_no' => '10511319',
                'reference_no' => '663446',
                'order_type' => 51,
                'ccc' => 'KALNA',
                'po_amount' => '28617.36',
                'project_id' => null,
            ]],
            'dcrc purbasthali' => ['5101128617 - PO (SYS).pdf', [
                'po_number' => '5101128617',
                'po_date' => '2026-06-30',
                'order_no' => '10517563',
                'reference_no' => '649349',
                'order_type' => 51,
                'ccc' => 'PBS',
                'po_amount' => '15394.28',
            ]],
            'capex baidyapur' => ['5301086659 - PO (SYS).pdf', [
                'po_number' => '5301086659',
                'po_date' => '2026-03-12',
                'project_id' => 'ALT/WS/AB/25/0383',
                'reference_no' => 'ALT/WS/AB/25/0383',
                'order_type' => 53,
                'ccc' => 'BDP',
                'po_amount' => '27799.92',
            ]],
            'draft capex' => ['5301099750 - PO (SYS).pdf', [
                'po_number' => '5301099750',
                'po_date' => '2026-04-13',
                'project_id' => 'ALT/WS/AB/25/0417',
                'reference_no' => 'ALT/WS/AB/25/0417',
                'order_type' => 53,
                'ccc' => 'BDP',
                'po_amount' => '31659.39',
            ]],
            'npc kalna' => ['5301103405 - PO (SYS).pdf', [
                'po_number' => '5301103405',
                'po_date' => '2026-04-29',
                'project_id' => 'NPC/3516101/03/26/02',
                'reference_no' => 'NPC/3516101/03/26/02',
                'order_no' => '1815069',
                'order_type' => 53,
                'ccc' => 'KALNA',
                'po_amount' => '23576.70',
            ]],
            'npc baidyapur' => ['5301120990 - PO (SYS).pdf', [
                'po_number' => '5301120990',
                'po_date' => '2026-06-23',
                'project_id' => 'NPC/3516103/05/26/02',
                'reference_no' => 'NPC/3516103/05/26/02',
                'order_no' => '1828930',
                'order_type' => 53,
                'ccc' => 'BDP',
                'po_amount' => '39255.67',
            ]],
        ];
    }

    private function fixture(string $filename): string
    {
        return base_path('tests/Fixtures/purchase-orders/'.$filename);
    }

    private function samplePath(string $filename): ?string
    {
        $sample = base_path('docs/sample_po/'.$filename);

        if (is_file($sample)) {
            return $sample;
        }

        $fixture = $this->fixture($filename);

        return is_file($fixture) ? $fixture : null;
    }
}
