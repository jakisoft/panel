import React, { lazy } from "react";
import { LucideIcon, Activity, Archive, CalendarDays, Cog, Database, Folder, KeyRound, LayoutGrid, Network, PlayCircle, TerminalSquare, UserCircle2, Users, Wrench } from "lucide-react";
import ServerConsole from "@/components/server/console/ServerConsoleContainer";
import DatabasesContainer from "@/components/server/databases/DatabasesContainer";
import ScheduleContainer from "@/components/server/schedules/ScheduleContainer";
import UsersContainer from "@/components/server/users/UsersContainer";
import BackupContainer from "@/components/server/backups/BackupContainer";
import NetworkContainer from "@/components/server/network/NetworkContainer";
import StartupContainer from "@/components/server/startup/StartupContainer";
import FileManagerContainer from "@/components/server/files/FileManagerContainer";
import SettingsContainer from "@/components/server/settings/SettingsContainer";
import AccountOverviewContainer from "@/components/dashboard/AccountOverviewContainer";
import AccountApiContainer from "@/components/dashboard/AccountApiContainer";
import AccountSSHContainer from "@/components/dashboard/ssh/AccountSSHContainer";
import ActivityLogContainer from "@/components/dashboard/activity/ActivityLogContainer";
import ServerActivityLogContainer from "@/components/server/ServerActivityLogContainer";

const FileEditContainer = lazy(() => import("@/components/server/files/FileEditContainer"));
const ScheduleEditContainer = lazy(() => import("@/components/server/schedules/ScheduleEditContainer"));

interface RouteDefinition {
  path: string;
  name: string | undefined;
  icon?: LucideIcon;
  component: React.ComponentType;
  exact?: boolean;
}

interface ServerRouteDefinition extends RouteDefinition {
  permission: string | string[] | null;
}

interface Routes {
  account: RouteDefinition[];
  server: ServerRouteDefinition[];
}

export default {
  account: [
    { path: "/", name: "Account", icon: UserCircle2, component: AccountOverviewContainer, exact: true },
    { path: "/api", name: "API Credentials", icon: KeyRound, component: AccountApiContainer },
    { path: "/ssh", name: "SSH Keys", icon: Wrench, component: AccountSSHContainer },
    { path: "/activity", name: "Activity", icon: Activity, component: ActivityLogContainer },
  ],
  server: [
    { path: "/", permission: null, name: "Console", icon: TerminalSquare, component: ServerConsole, exact: true },
    { path: "/files", permission: "file.*", name: "Files", icon: Folder, component: FileManagerContainer },
    { path: "/files/:action(edit|new)", permission: "file.*", name: undefined, component: FileEditContainer },
    { path: "/databases", permission: "database.*", name: "Databases", icon: Database, component: DatabasesContainer },
    { path: "/schedules", permission: "schedule.*", name: "Schedules", icon: CalendarDays, component: ScheduleContainer },
    { path: "/schedules/:id", permission: "schedule.*", name: undefined, component: ScheduleEditContainer },
    { path: "/users", permission: "user.*", name: "Users", icon: Users, component: UsersContainer },
    { path: "/backups", permission: "backup.*", name: "Backups", icon: Archive, component: BackupContainer },
    { path: "/network", permission: "allocation.*", name: "Network", icon: Network, component: NetworkContainer },
    { path: "/startup", permission: "startup.*", name: "Startup", icon: PlayCircle, component: StartupContainer },
    { path: "/settings", permission: ["settings.*", "file.sftp"], name: "Settings", icon: Cog, component: SettingsContainer },
    { path: "/activity", permission: "activity.*", name: "Activity", icon: LayoutGrid, component: ServerActivityLogContainer },
  ],
} as Routes;
