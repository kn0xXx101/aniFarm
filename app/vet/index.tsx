import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Stethoscope } from 'lucide-react-native';

import { OperationsScreen } from '@/components/operations/operations-screen';
import { OpsSection } from '@/components/operations/ops-section';
import { Card3D } from '@/components/ui/card-3d';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { EmptyState } from '@/components/layout/empty-state';
import { UpgradeBanner } from '@/components/subscription/upgrade-banner';
import { useOperationsStore } from '@/lib/stores/operations-store';
import { useActiveFarm } from '@/hooks/useActiveFarm';
import { useToast } from '@/components/ui/toast';
import { canUseFeature } from '@/lib/subscription/service';
import { COLORS, FONTS } from '@/lib/design-system';

const STATUS_COLOR: Record<string, string> = {
  open: COLORS.warning,
  scheduled: COLORS.secondary,
  closed: COLORS.inkMuted,
};

export default function VetScreen() {
  const { toast } = useToast();
  const vetGate = canUseFeature('vet_consult');
  const canChat = vetGate.ok;
  const { farmId, farm } = useActiveFarm();
  const consults = useOperationsStore((s) => s.vetConsults);
  const addVetConsult = useOperationsStore((s) => s.addVetConsult);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const list = useMemo(
    () => consults.filter((c) => !farmId || c.farmId === farmId),
    [consults, farmId],
  );

  const submit = () => {
    if (!canChat) {
      toast({ title: 'Vet chat requires Basic', description: vetGate.message, variant: 'destructive' });
      return;
    }
    if (!farmId) {
      toast({ title: 'Select a farm first', variant: 'destructive' });
      return;
    }
    if (!subject.trim()) {
      toast({ title: 'Subject required', variant: 'destructive' });
      return;
    }
    addVetConsult({
      farmId,
      subject: subject.trim(),
      message: message.trim() || 'Please review herd health.',
    });
    toast({ title: 'Sent to your vet', description: 'You will get a reply in the app.', variant: 'success' });
    setSubject('');
    setMessage('');
  };

  return (
    <OperationsScreen title="Vet consultation" subtitle="Message your veterinarian · Basic plan" requireFarm>
      <UpgradeBanner gate={vetGate} title="Vet chat requires Basic" />

      {canChat ? (
        <Card3D variant="glass" style={{ marginBottom: 8 }}>
          <Text style={{ color: COLORS.inkMuted, fontSize: 12, marginBottom: 12 }}>
            {farm?.name ? `Messaging for ${farm.name}` : 'Describe symptoms and urgency for your vet.'}
          </Text>
          <View style={{ gap: 14 }}>
            <Input label="Subject" value={subject} onChangeText={setSubject} placeholder="e.g. Limping in pen 3" />
            <Input
              label="Message"
              value={message}
              onChangeText={setMessage}
              multiline
              placeholder="Describe symptoms, counts, and urgency…"
            />
            <Button onPress={submit} style={{ width: '100%' }}>
              <Text>Send to vet</Text>
            </Button>
          </View>
        </Card3D>
      ) : null}

      <OpsSection eyebrow="Inbox" title={`${list.length} request${list.length === 1 ? '' : 's'}`} topGap={8}>
        {list.length === 0 ? (
          <EmptyState
            icon={<Stethoscope size={28} color={COLORS.secondary} strokeWidth={2} />}
            title="No vet messages yet"
            description="Send a consultation when you need a professional review of herd health."
          />
        ) : (
          list.map((c) => (
            <Card3D key={c.id} variant="glass" style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 16, flex: 1 }}>{c.subject}</Text>
                <Text
                  style={{
                    fontFamily: FONTS.semibold,
                    fontSize: 11,
                    color: STATUS_COLOR[c.status] ?? COLORS.inkMuted,
                    textTransform: 'uppercase',
                  }}
                >
                  {c.status}
                </Text>
              </View>
              {c.message ? (
                <Text style={{ color: COLORS.inkSecondary, fontSize: 13, marginTop: 6, lineHeight: 18 }}>
                  {c.message}
                </Text>
              ) : null}
              <Text style={{ color: COLORS.inkMuted, fontSize: 12, marginTop: 8 }}>
                Sent {new Date(c.createdAt).toLocaleString()}
                {c.scheduledAt ? ` · Visit ${new Date(c.scheduledAt).toLocaleDateString()}` : ''}
              </Text>
              {c.status === 'open' ? (
                <Text style={{ color: COLORS.secondary, fontSize: 12, marginTop: 6, fontFamily: FONTS.medium }}>
                  Your vet will respond in this thread.
                </Text>
              ) : null}
            </Card3D>
          ))
        )}
      </OpsSection>
    </OperationsScreen>
  );
}
