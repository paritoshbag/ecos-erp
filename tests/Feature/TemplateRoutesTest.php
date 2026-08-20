<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class TemplateRoutesTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, array{string, string}>
     */
    public static function templatePages(): array
    {
        return [
            'hub' => ['template.index', 'template/index'],
            'executive dashboard' => ['template.dashboards.executive', 'template/dashboards/executive'],
            'finance dashboard' => ['template.dashboards.finance', 'template/dashboards/finance'],
            'hr dashboard' => ['template.dashboards.hr', 'template/dashboards/hr'],
            'components' => ['template.components', 'template/components'],
            'forms' => ['template.forms', 'template/forms'],
            'wizard' => ['template.wizard', 'template/wizard'],
            'tables' => ['template.tables', 'template/tables'],
            'widgets' => ['template.widgets', 'template/widgets'],
            'files' => ['template.files', 'template/files'],
            'tasks' => ['template.tasks', 'template/tasks'],
            'login preview' => ['template.auth.login', 'template/auth/login'],
            'register preview' => ['template.auth.register', 'template/auth/register'],
            'forgot password preview' => ['template.auth.forgot-password', 'template/auth/forgot-password'],
        ];
    }

    #[DataProvider('templatePages')]
    public function test_template_pages_are_accessible_without_authentication(string $routeName, string $component): void
    {
        $response = $this->get(route($routeName));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page->component($component));
    }
}
