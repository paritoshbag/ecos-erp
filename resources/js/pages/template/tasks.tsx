import { Head } from '@inertiajs/react';
import {
    CalendarDays,
    Flag,
    MessageSquare,
    MoreHorizontal,
    Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/template/page-header';
import { StatusBadge } from '@/components/template/status-badge';
import type { StatusVariant } from '@/components/template/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { kanbanColumns } from '@/lib/template-data';
import type { KanbanTask } from '@/lib/template-data';

const priorityVariant: Record<KanbanTask['priority'], StatusVariant> = {
    high: 'destructive',
    medium: 'warning',
    low: 'neutral',
};

const priorityLabel: Record<KanbanTask['priority'], string> = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
};

export default function TemplateTasks() {
    return (
        <>
            <Head title="Tasks Board" />
            <PageHeader
                title="Tasks board"
                description="Kanban view of work across teams. Drag-and-drop and real-time sync arrive with the backend."
                actions={
                    <>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-36">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All teams</SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="hr">HR</SelectItem>
                                <SelectItem value="ops">Operations</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={() => toast.info('New task form opens')}
                        >
                            <Plus className="size-4" /> New task
                        </Button>
                    </>
                }
            />

            <div className="flex flex-1 gap-4 overflow-x-auto pb-2">
                {kanbanColumns.map((column) => (
                    <section
                        key={column.id}
                        className="flex w-72 shrink-0 flex-col gap-3 sm:w-80"
                        aria-label={`${column.title} column`}
                    >
                        <header className="flex items-center gap-2 px-1">
                            <h2 className="text-sm font-semibold">
                                {column.title}
                            </h2>
                            <Badge variant="secondary" className="tabular-nums">
                                {column.tasks.length}
                            </Badge>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="ms-auto size-7"
                                aria-label={`Add task to ${column.title}`}
                                onClick={() =>
                                    toast.info(`New task in “${column.title}”`)
                                }
                            >
                                <Plus className="size-4" />
                            </Button>
                        </header>

                        <div className="flex flex-col gap-2.5 rounded-xl bg-muted/60 p-2.5">
                            {column.tasks.map((task) => (
                                <Card
                                    key={task.id}
                                    className="cursor-pointer gap-3 py-3.5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <CardContent className="space-y-3 px-3.5">
                                        <div className="flex items-start justify-between gap-2">
                                            <Badge variant="outline">
                                                {task.tag}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="-mt-1 size-7"
                                                        aria-label={`Actions for ${task.id}`}
                                                    >
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            toast.info(
                                                                `${task.id} opens`,
                                                            )
                                                        }
                                                    >
                                                        Open task
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            toast.success(
                                                                `${task.id} moved to Done`,
                                                            )
                                                        }
                                                    >
                                                        Mark done
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <p className="text-sm leading-snug font-medium">
                                            {task.title}
                                        </p>

                                        <div className="flex items-center gap-2">
                                            <StatusBadge
                                                variant={
                                                    priorityVariant[
                                                        task.priority
                                                    ]
                                                }
                                                withDot={false}
                                            >
                                                <Flag className="size-3" />
                                                {priorityLabel[task.priority]}
                                            </StatusBadge>
                                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                <CalendarDays className="size-3.5" />
                                                {task.due}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex -space-x-1.5">
                                                {task.assignees.map(
                                                    (assignee) => (
                                                        <Avatar
                                                            key={assignee}
                                                            className="size-6 border-2 border-card"
                                                        >
                                                            <AvatarFallback className="bg-primary/10 text-[9px] font-semibold text-primary">
                                                                {assignee}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    ),
                                                )}
                                            </div>
                                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                <MessageSquare className="size-3.5" />
                                                {task.comments}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start text-muted-foreground"
                                onClick={() =>
                                    toast.info(`New task in “${column.title}”`)
                                }
                            >
                                <Plus className="size-4" /> Add task
                            </Button>
                        </div>
                    </section>
                ))}
            </div>
        </>
    );
}
