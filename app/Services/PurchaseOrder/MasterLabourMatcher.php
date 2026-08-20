<?php

namespace App\Services\PurchaseOrder;

use App\Models\MasterLabour;
use App\Models\PurchaseOrder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class MasterLabourMatcher
{
    /**
     * @param  list<array{
     *     line_no: int,
     *     description: string,
     *     hsn_sac: string|null,
     *     quantity: string,
     *     unit: string,
     *     rate: string,
     *     freight_and_insurance: string,
     *     amount: string
     * }>  $lines
     * @return list<array{
     *     line_no: int,
     *     description: string,
     *     hsn_sac: string|null,
     *     quantity: string,
     *     unit: string,
     *     rate: string,
     *     freight_and_insurance: string,
     *     amount: string,
     *     master_labour_id: int|null,
     *     master_description: string|null,
     *     in_master: bool
     * }>
     */
    public function preview(array $lines): array
    {
        $catalogue = $this->catalogue();

        return array_values(array_map(
            fn (array $line): array => $this->hydrate($line, $this->match($line, $catalogue)),
            $lines,
        ));
    }

    /**
     * @param  list<array{
     *     line_no: int,
     *     description: string,
     *     hsn_sac: string|null,
     *     quantity: string,
     *     unit: string,
     *     rate: string,
     *     freight_and_insurance: string,
     *     amount: string
     * }>  $lines
     */
    public function persist(PurchaseOrder $order, array $lines): void
    {
        $catalogue = $this->catalogue();

        foreach ($lines as $line) {
            $match = $this->match($line, $catalogue);
            $master = $match ?? $this->createMaster($line, $catalogue);

            $order->labours()->create([
                'master_labour_id' => $master->id,
                'line_no' => $line['line_no'],
                'description' => $line['description'],
                'hsn_sac' => $line['hsn_sac'],
                'quantity' => $line['quantity'],
                'unit' => $line['unit'],
                'rate' => $line['rate'],
                'freight_and_insurance' => $line['freight_and_insurance'],
                'amount' => $line['amount'],
            ]);
        }
    }

    /**
     * @return Collection<int, MasterLabour>
     */
    private function catalogue(): Collection
    {
        return MasterLabour::query()->get(['id', 'description', 'unit', 'price']);
    }

    /**
     * @param  array{
     *     description: string,
     *     unit: string,
     *     rate: string
     * }  $line
     * @param  Collection<int, MasterLabour>  $catalogue
     */
    private function match(array $line, Collection $catalogue): ?MasterLabour
    {
        $description = $this->normalize($line['description']);
        $unit = Str::upper($line['unit']);
        $rate = $this->money($line['rate']);

        $byDescription = $catalogue
            ->filter(fn (MasterLabour $row): bool => $this->normalize($row->description) === $description && Str::upper($row->unit) === $unit)
            ->values();

        $priced = $byDescription->first(fn (MasterLabour $row): bool => $this->money($row->price) === $rate);

        if ($priced instanceof MasterLabour) {
            return $priced;
        }

        if ($byDescription->count() === 1) {
            return $byDescription->first();
        }

        $byRate = $catalogue
            ->filter(fn (MasterLabour $row): bool => Str::upper($row->unit) === $unit && $this->money($row->price) === $rate)
            ->values();

        if ($byRate->count() === 1) {
            return $byRate->first();
        }

        if ($byRate->count() > 1) {
            return $this->closest($description, $byRate);
        }

        return null;
    }

    /**
     * @param  array{
     *     line_no: int,
     *     description: string,
     *     hsn_sac: string|null,
     *     quantity: string,
     *     unit: string,
     *     rate: string,
     *     freight_and_insurance: string,
     *     amount: string
     * }  $line
     * @return array{
     *     line_no: int,
     *     description: string,
     *     hsn_sac: string|null,
     *     quantity: string,
     *     unit: string,
     *     rate: string,
     *     freight_and_insurance: string,
     *     amount: string,
     *     master_labour_id: int|null,
     *     master_description: string|null,
     *     in_master: bool
     * }
     */
    private function hydrate(array $line, ?MasterLabour $match): array
    {
        return [
            ...$line,
            'master_labour_id' => $match?->id,
            'master_description' => $match?->description,
            'in_master' => $match instanceof MasterLabour,
        ];
    }

    /**
     * @param  array{description: string, unit: string, rate: string}  $line
     * @param  Collection<int, MasterLabour>  $catalogue
     */
    private function createMaster(array $line, Collection $catalogue): MasterLabour
    {
        $master = MasterLabour::query()->firstOrCreate([
            'description' => Str::limit($line['description'], 120, ''),
            'unit' => Str::upper($line['unit']),
            'price' => $this->money($line['rate']),
        ]);

        if ($catalogue->doesntContain(fn (MasterLabour $row): bool => $row->id === $master->id)) {
            $catalogue->push($master);
        }

        return $master;
    }

    /**
     * @param  Collection<int, MasterLabour>  $candidates
     */
    private function closest(string $description, Collection $candidates): MasterLabour
    {
        return $candidates
            ->sortByDesc(function (MasterLabour $row) use ($description): float {
                similar_text($description, $this->normalize($row->description), $percent);

                return $percent;
            })
            ->first() ?? $candidates->first();
    }

    private function normalize(string $value): string
    {
        return Str::upper(trim(preg_replace('/\s+/', ' ', $value) ?? $value));
    }

    private function money(string $value): string
    {
        return number_format((float) str_replace(',', '', $value), 2, '.', '');
    }
}
