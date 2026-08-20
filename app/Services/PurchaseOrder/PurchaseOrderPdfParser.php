<?php

namespace App\Services\PurchaseOrder;

use App\Exceptions\PurchaseOrderPdfUnreadableException;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Smalot\PdfParser\Parser;
use Throwable;

class PurchaseOrderPdfParser
{
    public function __construct(private Parser $parser = new Parser) {}

    /**
     * @return array{
     *     memo_number: string|null,
     *     memo_date: string|null,
     *     po_number: string|null,
     *     po_date: string|null,
     *     project_id: string|null,
     *     order_no: string|null,
     *     reference_no: string|null,
     *     order_type: int|null,
     *     ccc: string|null,
     *     description: string|null,
     *     po_amount: string|null,
     *     pdf_hash: string,
     *     lines: list<array{
     *         line_no: int,
     *         description: string,
     *         hsn_sac: string|null,
     *         quantity: string,
     *         unit: string,
     *         rate: string,
     *         freight_and_insurance: string,
     *         amount: string
     *     }>
     * }
     */
    public function parse(UploadedFile $file): array
    {
        $path = $file->getRealPath();

        if ($path === false) {
            throw new PurchaseOrderPdfUnreadableException;
        }

        return $this->parsePath($path);
    }

    /**
     * @return array{
     *     memo_number: string|null,
     *     memo_date: string|null,
     *     po_number: string|null,
     *     po_date: string|null,
     *     project_id: string|null,
     *     order_no: string|null,
     *     reference_no: string|null,
     *     order_type: int|null,
     *     ccc: string|null,
     *     description: string|null,
     *     po_amount: string|null,
     *     pdf_hash: string,
     *     lines: list<array{
     *         line_no: int,
     *         description: string,
     *         hsn_sac: string|null,
     *         quantity: string,
     *         unit: string,
     *         rate: string,
     *         freight_and_insurance: string,
     *         amount: string
     *     }>
     * }
     */
    public function parsePath(string $path): array
    {
        $hash = hash_file('sha256', $path);

        if ($hash === false) {
            throw new PurchaseOrderPdfUnreadableException;
        }

        try {
            $text = $this->parser->parseFile($path)->getText();
        } catch (Throwable) {
            throw new PurchaseOrderPdfUnreadableException;
        }

        if (trim($text) === '') {
            throw new PurchaseOrderPdfUnreadableException;
        }

        $poNumber = $this->match('/PO\s*No\.?:\s*(\d+)\s*PO\s*Dated:/i', $text);
        $poDate = $this->toIsoDate($this->match('/PO\s*Dated:\s*(\d{2}\.\d{2}\.\d{4})/i', $text));
        $memoNumber = $this->limit($this->match('/Memo\s*No\.?\s*(.+?)\s*Dated:/i', $text), 40);
        $memoDate = $this->toIsoDate($this->match('/Memo\s*No\.?\s*.+?\s*Dated:\s*(\d{2}\.\d{2}\.\d{4})/i', $text));
        $projectId = $this->limit($this->match('/PROJECT\s*ID\s*[:\-]\s*(\S+)/i', $text), 80);
        $orderNo = $this->limit(
            $this->match('/ORDER\s*NO\s*[:\-]?\s*(\d+)/i', $text)
                ?? $this->match('/WO\s*NO\s*[:\-]?\s*(\d+)/i', $text),
            40,
        );
        $referenceNo = $this->extractRefNo($text);
        $amount = $this->toAmount($this->match('/Total Amount\(Rs\.\)\(Including Tax\)\s*([\d,]+\.\d{2})/i', $text));

        return [
            'memo_number' => $memoNumber,
            'memo_date' => $memoDate,
            'po_number' => $poNumber,
            'po_date' => $poDate,
            'project_id' => $projectId,
            'order_no' => $orderNo,
            'reference_no' => $referenceNo,
            'order_type' => $this->orderTypeFromPoNumber($poNumber),
            'ccc' => $this->extractCcc($text),
            'description' => $this->extractDescription($text),
            'po_amount' => $amount,
            'pdf_hash' => $hash,
            'lines' => $this->extractLines($text),
        ];
    }

    /**
     * Hash the uploaded file without parsing it.
     */
    public function hash(UploadedFile $file): string
    {
        $path = $file->getRealPath();

        if ($path === false) {
            throw new PurchaseOrderPdfUnreadableException;
        }

        $hash = hash_file('sha256', $path);

        if ($hash === false) {
            throw new PurchaseOrderPdfUnreadableException;
        }

        return $hash;
    }

    private function match(string $pattern, string $text): ?string
    {
        if (preg_match($pattern, $text, $matches) !== 1) {
            return null;
        }

        $value = trim($matches[1]);

        return $value === '' ? null : $value;
    }

    private function toIsoDate(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $date = rescue(fn (): Carbon => Carbon::createFromFormat('d.m.Y', $value), report: false);

        return $date instanceof Carbon ? $date->toDateString() : null;
    }

    private function toAmount(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        return number_format((float) str_replace(',', '', $value), 2, '.', '');
    }

    private function orderTypeFromPoNumber(?string $poNumber): ?int
    {
        if ($poNumber === null || strlen($poNumber) < 2) {
            return null;
        }

        return (int) substr($poNumber, 0, 2);
    }

    private function extractCcc(string $text): ?string
    {
        $name = $this->match('/UNDER\s+([A-Za-z][A-Za-z\s]*?)\s+CCC/i', $text)
            ?? $this->match('/SM\s*,?\s*([A-Za-z][A-Za-z\s]*?)\s+CCC/i', $text);

        if ($name === null) {
            return null;
        }

        $normalized = Str::upper(preg_replace('/\s+/', ' ', trim($name)) ?? $name);

        /** @var array<string, string> $aliases */
        $aliases = config('purchase-orders.ccc_aliases', []);

        if (isset($aliases[$normalized])) {
            return $aliases[$normalized];
        }

        return Str::limit($normalized, 10, '');
    }

    private function extractDescription(string $text): ?string
    {
        if (preg_match('/Sub:\s*(.+?)(?=\n\s*Ref:|\n\s*WORK DETAILS|Dear Sir)/is', $text, $matches) !== 1) {
            return null;
        }

        $description = trim(preg_replace('/\s+/', ' ', $matches[1]) ?? $matches[1]);

        return $description === '' ? null : $description;
    }

    /**
     * Ref sits under the subject: project / ref id when present, otherwise E-Office no.
     */
    private function extractRefNo(string $text): ?string
    {
        return $this->limit(
            $this->match('/PROJECT\s*ID\s*[:\-]\s*(\S+)/i', $text)
                ?? $this->match('/EOFFICE\s*NO\s*[:\-]?\s*(\d+)/i', $text),
            40,
        );
    }

    /**
     * @return list<array{
     *     line_no: int,
     *     description: string,
     *     hsn_sac: string|null,
     *     quantity: string,
     *     unit: string,
     *     rate: string,
     *     freight_and_insurance: string,
     *     amount: string
     * }>
     */
    private function extractLines(string $text): array
    {
        $table = $this->tableText($text);

        if ($table === null) {
            return [];
        }

        $pattern = '/(\d+\.\d{3})\s+(NOS|SET|KM|MT|MTR|JOB|LS|LOT|RM|KGS|KG)\s+([\d,]+\.\d{2})((?:\s+[\d,]+\.\d{2}){2,})/';

        if (preg_match_all($pattern, $table, $matches, PREG_OFFSET_CAPTURE) === 0) {
            return [];
        }

        $lines = [];
        $count = count($matches[0]);

        for ($index = 0; $index < $count; $index++) {
            $rest = preg_split('/\s+/', trim($matches[4][$index][0]));
            $amount = $this->toAmount((string) array_pop($rest));
            $freight = '0.00';

            if (is_array($rest) && count($rest) >= 3) {
                $freight = $this->toAmount((string) $rest[count($rest) - 1]) ?? '0.00';
            }

            $start = $index === 0 ? 0 : ($matches[0][$index - 1][1] + strlen($matches[0][$index - 1][0]));
            $prefix = $this->parseLinePrefix(
                substr($table, $start, $matches[0][$index][1] - $start),
                $index + 1,
            );

            if ($prefix['continuation'] !== null && $lines !== []) {
                $last = count($lines) - 1;
                $lines[$last]['description'] = trim($lines[$last]['description'].' '.$prefix['continuation']);
            }

            $lines[] = [
                'line_no' => $prefix['line_no'],
                'description' => $prefix['description'],
                'hsn_sac' => $prefix['hsn_sac'],
                'quantity' => $this->toQuantity($matches[1][$index][0]),
                'unit' => $matches[2][$index][0],
                'rate' => $this->toAmount($matches[3][$index][0]) ?? '0.00',
                'freight_and_insurance' => $freight,
                'amount' => $amount ?? '0.00',
            ];
        }

        return $lines;
    }

    private function tableText(string $text): ?string
    {
        if (preg_match('/Material\/Service Description(.+?)Total\(Rs\.\)/is', $text, $matches) !== 1) {
            return null;
        }

        $table = $matches[1];
        $table = preg_replace('/Page:\s*\d+\s+of\s+\d+.*?Excl Taxes\)/is', ' ', $table) ?? $table;
        $table = preg_replace('/WEST BENGAL STATE ELECTRICITY.*?Excl Taxes\)/is', ' ', $table) ?? $table;
        $table = preg_replace('/DRAFT COPY/i', ' ', $table) ?? $table;
        $table = preg_replace('/Sl\.\s*No\./i', ' ', $table) ?? $table;
        $table = preg_replace('/Material\/Service Description.*?(?:Excl Taxes\))?/is', ' ', $table) ?? $table;
        $table = str_replace(["\t", "\r"], ' ', $table);
        $table = preg_replace('/\s+/', ' ', $table) ?? $table;
        $table = trim($table);

        if (preg_match('/(?:^|\s)(1(?:\s+|(?=[A-Za-z])))/', $table, $match, PREG_OFFSET_CAPTURE) === 1) {
            $table = substr($table, $match[1][1]);
        }

        return trim($table);
    }

    /**
     * @return array{continuation: string|null, line_no: int, description: string, hsn_sac: string|null}
     */
    private function parseLinePrefix(string $prefix, int $expectedLineNo): array
    {
        $prefix = trim($prefix);
        $hsn = null;

        if (preg_match('/\s(\d{4,8})$/', $prefix, $matches) === 1) {
            $hsn = $matches[1];
            $prefix = trim(substr($prefix, 0, -strlen($matches[0])));
        }

        $serial = preg_quote((string) $expectedLineNo, '/');

        if (preg_match('/(?:^|(?<=\s))'.$serial.'(?:\s+|(?=[A-Za-z]))/', $prefix, $match, PREG_OFFSET_CAPTURE) === 1) {
            $before = trim(substr($prefix, 0, $match[0][1]));
            $after = trim(substr($prefix, $match[0][1] + strlen($match[0][0])));

            if ($before !== '' && preg_match('/HSN|Quantity|Excl Taxes|IGST|CGST/i', $before) === 1) {
                $before = '';
            }

            return [
                'continuation' => $before === '' ? null : $before,
                'line_no' => $expectedLineNo,
                'description' => $this->squish($after),
                'hsn_sac' => $hsn,
            ];
        }

        return [
            'continuation' => null,
            'line_no' => $expectedLineNo,
            'description' => $this->squish($prefix),
            'hsn_sac' => $hsn,
        ];
    }

    private function toQuantity(string $value): string
    {
        return number_format((float) $value, 3, '.', '');
    }

    private function squish(string $value): string
    {
        return trim(preg_replace('/\s+/', ' ', $value) ?? $value);
    }

    private function limit(?string $value, int $max): ?string
    {
        if ($value === null) {
            return null;
        }

        return Str::limit($value, $max, '');
    }
}
