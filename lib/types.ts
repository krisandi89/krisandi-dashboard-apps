// Application data types

export type AppType = "web" | "local";

export interface App {
  id: string;
  name: string;
  url: string;
  type: AppType;
  tags: string[];
  description: string;
  icon: string;
  isPinned: boolean;
  startCommand: string; // Path to .command or shell script to start local server
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppInput {
  name: string;
  url: string;
  tags?: string[];
  description?: string;
  icon?: string;
  isPinned?: boolean;
}

export interface UpdateAppInput {
  name?: string;
  url?: string;
  tags?: string[];
  description?: string;
  icon?: string;
  isPinned?: boolean;
}

export interface AppsData {
  apps: App[];
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  code?: string;
}

export type SortOption = "pinned" | "name" | "updated";
export type FilterType = "all" | "web" | "local";
