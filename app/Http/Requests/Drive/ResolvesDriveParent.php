<?php

namespace App\Http\Requests\Drive;

use App\Models\DriveItem;

trait ResolvesDriveParent
{
    public function parentFolder(): ?DriveItem
    {
        $id = $this->input('parent_id');

        if ($id === null || $id === '') {
            return null;
        }

        return DriveItem::query()->find((int) $id);
    }

    protected function prepareParentId(): void
    {
        if ($this->input('parent_id') === '' || $this->input('parent_id') === 'root') {
            $this->merge(['parent_id' => null]);
        }
    }
}
