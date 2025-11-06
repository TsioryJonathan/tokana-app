import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

// Small local component for label/value row
export const Row = ({ label, value, multiline = false }: { label: string; value: string | number; multiline?: boolean }) => {
  const valueStr = String(value);
  const isLongText = valueStr.length > 30 || multiline;
  
  if (isLongText) {
    // Pour les textes longs (comme les adresses), afficher en colonne avec troncature à 1 ligne
    return (
      <View style={styles.multilineContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.multilineValue} numberOfLines={1} ellipsizeMode="tail">
          {valueStr}
        </Text>
      </View>
    );
  }
  
  // Pour les textes courts, afficher en ligne
  return (
    <View style={styles.rowContainer}>
      <Text style={styles.labelInline}>{label}</Text>
      <Text style={styles.valueInline} numberOfLines={1} ellipsizeMode="tail">
        {valueStr}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  labelInline: {
    color: '#64748B',
    flexShrink: 0,
    marginRight: 8,
  },
  valueInline: {
    color: '#1E293B',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  multilineContainer: {
    paddingVertical: 8,
    width: '100%',
  },
  label: {
    color: '#64748B',
    marginBottom: 4,
    fontSize: 14,
  },
  multilineValue: {
    color: '#1E293B',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    width: '100%',
  },
});

export default Row;