import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Sparkles, Crown, Building2, Leaf } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/components/ui/toast';
import type { SubscriptionTier } from '@/types/domain';

const PLANS: {
  tier: SubscriptionTier;
  name: string;
  price: string;
  cadence: string;
  icon: typeof Leaf;
  features: string[];
  highlight?: boolean;
}[] = [
  {
    tier: 'free',
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    icon: Leaf,
    features: ['1 farm', '20 AI counts / month', 'Image counting', 'Community support'],
  },
  {
    tier: 'basic',
    name: 'Basic',
    price: '$19',
    cadence: '/ month',
    icon: Sparkles,
    features: ['3 farms', '500 AI counts / month', 'Image + Video', 'Email reports', 'Offline mode'],
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: '$49',
    cadence: '/ month',
    icon: Crown,
    features: [
      'Unlimited farms',
      'Unlimited counts',
      'Live + Image + Video',
      'AI tracking + alerts',
      'PDF / CSV / Excel exports',
      'Priority support',
    ],
    highlight: true,
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    cadence: 'contact us',
    icon: Building2,
    features: [
      'Multi-tenant org',
      'On-prem / private cloud',
      'Custom YOLOv8 training',
      'SLA + dedicated CSM',
      'API + integrations',
    ],
  },
];

export default function Subscription() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setTier = useAuthStore((s) => s.setTier);
  const toast = useToast();

  const select = (tier: SubscriptionTier) => {
    if (tier === 'enterprise') {
      toast.toast({ title: 'We\'ll be in touch', description: 'Our team will reach out within 1 business day.', variant: 'success' });
      return;
    }
    setTier(tier);
    toast.toast({ title: `Upgraded to ${tier}`, variant: 'success' });
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Text className="text-2xl font-bold text-foreground">Plans & billing</Text>
      <Text variant="muted" size="sm" className="mt-1 mb-5">
        Pick the plan that matches your flock size.
      </Text>

      {PLANS.map((p) => {
        const Icon = p.icon;
        const active = user?.tier === p.tier;
        return (
          <View
            key={p.tier}
            className={`rounded-2xl border-2 bg-card p-4 mb-3 ${p.highlight ? 'border-primary' : 'border-border'}`}
          >
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-row items-center gap-3">
                <View className={`size-10 rounded-xl items-center justify-center ${p.highlight ? 'bg-primary' : 'bg-muted'}`}>
                  <Icon size={20} color={p.highlight ? 'white' : '#00FFA3'} />
                </View>
                <View>
                  <Text className="font-bold text-lg">{p.name}</Text>
                  <View className="flex-row items-baseline gap-1">
                    <Text className="text-2xl font-bold text-primary">{p.price}</Text>
                    <Text variant="muted" size="xs">{p.cadence}</Text>
                  </View>
                </View>
              </View>
              {p.highlight ? (
                <Badge className="bg-primary">
                  <Text size="xs" className="text-primary-foreground font-semibold">Popular</Text>
                </Badge>
              ) : null}
              {active ? (
                <Badge variant="secondary">
                  <Text size="xs">Current</Text>
                </Badge>
              ) : null}
            </View>
            <View className="gap-2 mb-4">
              {p.features.map((f) => (
                <View key={f} className="flex-row items-center gap-2">
                  <Check size={14} color="#00FFA3" />
                  <Text size="sm">{f}</Text>
                </View>
              ))}
            </View>
            {!active ? (
              <Pressable onPress={() => select(p.tier)}>
                <Button onPress={() => select(p.tier)} variant={p.highlight ? 'default' : 'outline'}>
                  <Text className={p.highlight ? 'text-primary-foreground font-semibold' : 'font-semibold'}>
                    {p.tier === 'enterprise' ? 'Contact sales' : `Choose ${p.name}`}
                  </Text>
                </Button>
              </Pressable>
            ) : null}
          </View>
        );
      })}

      <Text variant="muted" size="xs" className="text-center mt-4">
        Mock prices shown — real App Store/Play Store prices appear after distribution.
      </Text>
    </ScrollView>
  );
}
