import type { ComponentType } from "react";
import type { WindowId } from "@/lib/windows";
import { AboutWindow } from "@/components/windows/AboutWindow";
import { BlogWindow } from "@/components/windows/BlogWindow";
import { ContactWindow } from "@/components/windows/ContactWindow";
import { CvWindow } from "@/components/windows/CvWindow";
import { DemoWindow } from "@/components/windows/DemoWindow";
import { HomelabWindow } from "@/components/windows/HomelabWindow";
import { NotFoundWindow } from "@/components/windows/NotFoundWindow";
import { PipelinesWindow } from "@/components/windows/PipelinesWindow";
import { PricingWindow } from "@/components/windows/PricingWindow";
import { ProcessWindow } from "@/components/windows/ProcessWindow";
import { ServicesWindow } from "@/components/windows/ServicesWindow";
import { TrashWindow } from "@/components/windows/TrashWindow";
import { WelcomeWindow } from "@/components/windows/WelcomeWindow";
import { WorkWindow } from "@/components/windows/WorkWindow";

export const WINDOW_CONTENT: Record<WindowId, ComponentType> = {
  welcome: WelcomeWindow,
  services: ServicesWindow,
  work: WorkWindow,
  process: ProcessWindow,
  about: AboutWindow,
  pricing: PricingWindow,
  contact: ContactWindow,
  cv: CvWindow,
  blog: BlogWindow,
  homelab: HomelabWindow,
  pipelines: PipelinesWindow,
  demo: DemoWindow,
  trash: TrashWindow,
  notFound: NotFoundWindow,
};
