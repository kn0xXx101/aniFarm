import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Shield, User } from 'lucide-react-native';

import { AppScreen } from '@/components/shell/app-screen';
import { Button3D } from '@/components/neo3d/button-3d';
import { Input3D } from '@/components/neo3d/input-3d';
import { Text } from '@/components/ui/text';
import { Card3D } from '@/components/ui/card-3d';
import { COLORS, FONTS } from '@/lib/design-system';

export default function UiDebugScreen() {
  const [val, setVal] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <AppScreen>
      <View style={styles.container}>
        <Text style={styles.screenHeader}>3D UI Debug</Text>
        
        <Text style={styles.sectionTitle}>Button3D Showcase</Text>
        <View style={styles.row}>
          <Button3D variant="primary" loading={loading} onPress={toggleLoading}>
            <Text>Primary 3D Button</Text>
          </Button3D>
        </View>
        <View style={styles.row}>
          <Button3D variant="secondary" glowColor={COLORS.secondary}>
            <Text>Secondary 3D Button</Text>
          </Button3D>
        </View>
        <View style={styles.row}>
          <Button3D variant="glass">
            <Text>Glass 3D Button</Text>
          </Button3D>
        </View>

        <Text style={styles.sectionTitle}>Input3D Showcase</Text>
        <Input3D
          label="Full Name"
          placeholder="Enter your name..."
          value={val}
          onChangeText={setVal}
          leftIcon={<User size={18} color={COLORS.inkMuted} />}
        />
        <Input3D
          label="Secret Key"
          placeholder="Enter key..."
          secureTextEntry
          leftIcon={<Shield size={18} color={COLORS.inkMuted} />}
          error={val.length > 0 && val.length < 5 ? 'Too short' : undefined}
        />

        <Text style={styles.sectionTitle}>Cards & Depth</Text>
        <Card3D variant="neon" glowColor={COLORS.primary} tiltEnabled style={{ height: 120, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink }}>Interact with me</Text>
          <Text style={{ fontSize: 12, color: COLORS.inkSecondary }}>Tilt enabled neon card</Text>
        </Card3D>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  screenHeader: {
    fontFamily: FONTS.display,
    fontSize: 28,
    color: COLORS.ink,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.inkSecondary,
    marginTop: 10,
    marginBottom: 4,
  },
  row: {
    width: '100%',
  },
});
