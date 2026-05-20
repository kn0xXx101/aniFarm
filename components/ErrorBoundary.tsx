import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Pressable } from 'react-native';

import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/design-system';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.error) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: COLORS.canvas,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <Text style={{ fontFamily: FONTS.bold, color: COLORS.primary, fontSize: 20, marginBottom: 8 }}>
            Something went wrong
          </Text>
          <Text style={{ color: COLORS.inkMuted, textAlign: 'center', marginBottom: 20, lineHeight: 22 }}>
            {this.state.error.message || 'An unexpected error occurred.'}
          </Text>
          <Pressable
            onPress={this.handleReset}
            style={{
              backgroundColor: COLORS.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontFamily: FONTS.bold, color: COLORS.canvas }}>Try again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
