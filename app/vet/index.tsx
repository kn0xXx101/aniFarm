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
import { useOperationsStore } from '@/lib/stores/operations-store';
import { useActiveFarm } from '@/hooks/useActiveFarm';
import { useToast } from '@/components/ui/toast';
import { COLORS, FONTS } from '@/lib/design-system';

export default function VetScreen() {
  const toast = useToast();
  const { farmId } = useActiveFarm();
  const consults = useOperationsStore((s) => s.vetConsults);
  const addVetConsult = useOperationsStore((s) => s.addVetConsult);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const list = useMemo(
    () => consults.filter((c) => !farmId || c.farmId === farmId),
    [consults, farmId],
  );

  const submit = () => {
    if (!farmId) {
      toast.toast({ title: 'Select a farm first', variant: 'destructive' });
      return;
    }
    if (!subject.trim()) {
      toast.toast({ title: 'Subject required', variant: 'destructive' });
      return;
    }
    addVetConsult({
      farmId,
      subject: subject.trim(),
      message: message.trim() || 'Please review herd health.',
    });
    toast.toast({ title: 'Sent to vet queue', variant: 'success' });
    setSubject('');
    setMessage('');
  };

  return (
    <OperationsScreen title="Vet consultation" subtitle="Message your veterinarian">
      <Card3D variant="glass" style={{ marginBottom: 8 }}>
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
            Send request
          </Button>
        </View>
      </Card3D>

      <OpsSection eyebrow="Inbox" title={`${list.length} requests`} topGap={8}>
        {list.length === 0 ? (
          <EmptyState
            icon={<Stethoscope size={28} color={COLORS.secondary} strokeWidth={2} />}
            title="No vet requests"
            description="Send a consultation when you need a professional review of herd health."
          />
        ) : (
          list.map((c) => (
            <Card3D key={c.id} variant="glass" style={{ marginBottom: 8 }}>
              <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 16 }}>{c.subject}</Text>
              {c.message ? (
                <Text style={{ color: COLORS.inkSecondary, fontSize: 13, marginTop: 6, lineHeight: 18 }} numberOfLines={3}>
                  {c.message}
                </Text>
              ) : null}
              <Text style={{ color: COLORS.inkMuted, fontSize: 12, marginTop: 6 }}>
                {c.status} · {new Date(c.createdAt).toLocaleDateString()}
              </Text>
            </Card3D>
          ))
        )}
      </OpsSection>
    </OperationsScreen>
  );
}
