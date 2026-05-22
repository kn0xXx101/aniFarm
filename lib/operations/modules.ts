import type { Href } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import {
  BarChart3,
  Bell,
  Camera,
  ClipboardList,
  FileText,
  HeartPulse,
  Package,
  Scale,
  Shield,
  Stethoscope,
  Syringe,
  Tv2,
  Users,
  Wheat,
} from 'lucide-react-native';

import { COLORS } from '@/lib/design-system';

export interface FarmModule {
  id: string;
  title: string;
  description: string;
  href: Href;
  icon: LucideIcon;
  color: string;
  tab?: 'dashboard' | 'scan' | 'cctv' | 'farms' | 'you';
}

/** All MVP modules — reached via stack routes (tab bar unchanged). */
export const FARM_MODULES: FarmModule[] = [
  {
    id: 'animals',
    title: 'Animal registry',
    description: 'Individual & batch registration, RFID, QR tags',
    href: '/animals',
    icon: Users,
    color: COLORS.primary,
    tab: 'farms',
  },
  {
    id: 'scan',
    title: 'AI counting',
    description: 'Live, image, video — humans excluded',
    href: '/(tabs)/scan',
    icon: Camera,
    color: COLORS.primary,
    tab: 'scan',
  },
  {
    id: 'cctv',
    title: 'CCTV monitoring',
    description: 'RTSP/HLS streams, live AI overlays',
    href: '/(tabs)/cctv',
    icon: Tv2,
    color: COLORS.secondary,
    tab: 'cctv',
  },
  {
    id: 'disease',
    title: 'Disease scan',
    description: 'Photo-based disease suspicion',
    href: '/disease-scan',
    icon: HeartPulse,
    color: COLORS.danger,
  },
  {
    id: 'feed',
    title: 'Feed management',
    description: 'Stock, consumption, low-feed alerts',
    href: '/feed',
    icon: Wheat,
    color: COLORS.accent,
  },
  {
    id: 'health',
    title: 'Health & welfare',
    description: 'Vaccination, weight, mortality, breeding',
    href: '/health',
    icon: Syringe,
    color: COLORS.secondary,
  },
  {
    id: 'tasks',
    title: 'Tasks',
    description: 'Feeding, cleaning, vet, AI incidents',
    href: '/tasks',
    icon: ClipboardList,
    color: COLORS.primary,
  },
  {
    id: 'sales',
    title: 'Sales & inventory',
    description: 'Revenue, eggs, milk, harvests',
    href: '/sales',
    icon: Package,
    color: COLORS.accent,
  },
  {
    id: 'analytics',
    title: 'Farm analytics',
    description: 'Population, mortality, trends',
    href: '/(tabs)/analytics',
    icon: BarChart3,
    color: COLORS.accent,
  },
  {
    id: 'reports',
    title: 'Reports',
    description: 'PDF, CSV, Excel exports',
    href: '/(tabs)/reports',
    icon: FileText,
    color: COLORS.inkSecondary,
  },
  {
    id: 'alerts',
    title: 'Alert center',
    description: 'Dead, sick, intrusion, feed, vaccines',
    href: '/(tabs)/alerts',
    icon: Bell,
    color: COLORS.danger,
  },
  {
    id: 'vet',
    title: 'Vet consultation',
    description: 'Message your veterinarian',
    href: '/vet',
    icon: Stethoscope,
    color: COLORS.secondary,
  },
  {
    id: 'security',
    title: 'Security log',
    description: 'Human detection & intrusion events',
    href: '/security',
    icon: Shield,
    color: COLORS.danger,
  },
  {
    id: 'weight',
    title: 'Weight tracking',
    description: 'Growth charts & benchmarks',
    href: '/health?section=weight',
    icon: Scale,
    color: COLORS.primary,
  },
];

export const DASHBOARD_MODULE_IDS = [
  'animals',
  'scan',
  'cctv',
  'disease',
  'feed',
  'health',
  'tasks',
  'sales',
  'alerts',
  'analytics',
] as const;
