<?php

namespace Database\Factories;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Organization>
 */
class OrganizationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'singleton' => 1,
            'company_name' => 'Maakali Construction',
            'gst' => '19AAAAA0000A1Z5',
            'pan' => 'AAAAA0000A',
            'address' => 'Burdwan, West Bengal',
            'email' => 'accounts@example.com',
            'website' => 'https://example.com',
            'mobile' => '9876543210',
            'secondary_mobile' => '9123456789',
            'company_type' => 'Private Limited',
            'vendor_code' => 'VEND001',
            'field1' => 'Custom one',
            'field2' => 'Custom two',
            'field3' => 'Custom three',
            'field4' => 'Custom four',
            'field5' => 'Custom five',
        ];
    }
}
