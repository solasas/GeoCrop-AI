import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { fetchHealth, fetchFields, fetchYieldPrediction } from '../services/api';
import { Sprout, Cpu, TrendingUp, Calendar, MapPin, Award, Layers } from 'lucide-react-native';

export default function HomeScreen({ onSelectField }) {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [hData, fData] = await Promise.all([
      fetchHealth(),
      fetchFields()
    ]);
    setHealth(hData);
    setFields(fData);

    const target = fData.length > 0 ? fData[0] : null;
    setSelectedField(target);

    if (target) {
      try {
        const predRes = await fetchYieldPrediction(target.id);
        setPrediction(predRes.prediction);
      } catch (e) {
        console.error('Failed prediction fetch:', e);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSelect = async (field) => {
    setSelectedField(field);
    try {
      const predRes = await fetchYieldPrediction(field.id);
      setPrediction(predRes.prediction);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Top Mobile Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Sprout size={20} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.brandTitle}>GeoCrop AI</Text>
            <Text style={styles.brandSub}>Precision Ag Mobile</Text>
          </View>
        </View>

        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: health?.status === 'online' ? '#22c55e' : '#f59e0b' }]} />
          <Text style={styles.statusText}>{health?.status === 'online' ? 'FastAPI Online' : 'Standby'}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Rice Crop Featured Card */}
        {selectedField && (
          <View style={styles.riceCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cropTitle}>{selectedField.name}</Text>
              <View style={styles.cropBadge}>
                <Text style={styles.cropBadgeText}>{selectedField.crop_type}</Text>
              </View>
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.metricCol}>
                <Text style={styles.metricLabel}>Seeding</Text>
                <Text style={styles.metricVal}>25 <Text style={styles.unit}>kg/ha</Text></Text>
              </View>
              <View style={styles.metricCol}>
                <Text style={styles.metricLabel}>Area</Text>
                <Text style={styles.metricVal}>{selectedField.area_hectares} <Text style={styles.unit}>Ha</Text></Text>
              </View>
              <View style={styles.metricCol}>
                <Text style={styles.metricLabel}>Seed Qty</Text>
                <Text style={styles.metricVal}>{Math.round(25 * selectedField.area_hectares)} <Text style={styles.unit}>kg</Text></Text>
              </View>
            </View>

            <View style={styles.expenseSection}>
              <View style={styles.expenseRow}>
                <Text style={styles.expenseTitle}>Crop Expenses</Text>
                <Text style={styles.expenseVal}>$1.8M <Text style={styles.totalText}>Total</Text></Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { flex: 8, backgroundColor: '#22c55e' }]} />
                <View style={[styles.progressBar, { flex: 2, backgroundColor: '#facc15' }]} />
              </View>
            </View>
          </View>
        )}

        {/* XGBoost Yield Prediction Card */}
        {prediction && (
          <View style={styles.predictionCard}>
            <View style={styles.predHeader}>
              <Cpu size={18} color="#10b981" />
              <Text style={styles.predTitle}>XGBoost Yield Forecast</Text>
              <Text style={styles.confText}>95% CI</Text>
            </View>

            <View style={styles.predMainRow}>
              <View>
                <Text style={styles.predLabel}>Estimated Yield Rate</Text>
                <Text style={styles.predVal}>{prediction.predicted_yield_t_per_ha} <Text style={styles.predUnit}>t/ha</Text></Text>
                <Text style={styles.rangeText}>Range: {prediction.confidence_interval?.lower_bound} – {prediction.confidence_interval?.upper_bound} t/ha</Text>
              </View>

              <View style={styles.tonnageCol}>
                <Text style={styles.predLabel}>Harvest Forecast</Text>
                <Text style={styles.tonnageVal}>{prediction.total_production_tons} <Text style={styles.predUnit}>Tons</Text></Text>
              </View>
            </View>

            {/* SHAP Factor Impact Breakdown */}
            {prediction.shap_explanations && prediction.shap_explanations.length > 0 && (
              <View style={styles.shapContainer}>
                <Text style={styles.shapTitle}>Top SHAP Drivers</Text>
                {prediction.shap_explanations.slice(0, 2).map((item, idx) => (
                  <View key={idx} style={styles.shapRow}>
                    <Text style={styles.shapName}>{item.feature_name}</Text>
                    <Text style={[styles.shapImpact, { color: item.is_positive ? '#10b981' : '#ef4444' }]}>
                      {item.impact_label}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Farm Field Parcels List */}
        <View style={styles.parcelsContainer}>
          <Text style={styles.sectionTitle}>Farm Field Parcels ({fields.length})</Text>

          {fields.map((f) => {
            const isSel = selectedField?.id === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => handleSelect(f)}
                style={[styles.parcelItem, isSel && styles.selectedParcelItem]}
              >
                <View>
                  <Text style={styles.parcelName}>{f.name}</Text>
                  <Text style={styles.parcelSub}>{f.crop_type} • {f.area_hectares} Ha</Text>
                </View>
                <Text style={styles.dateText}>{f.planting_date}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  brandSub: {
    fontSize: 10,
    color: '#64748b',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  riceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cropTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  cropBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  cropBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },
  metricCol: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  unit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  expenseSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  expenseTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  expenseVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  totalText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#64748b',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    gap: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  predictionCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 18,
  },
  predHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  predTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  confText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10b981',
    backgroundColor: '#022c22',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  predMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  predLabel: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  predVal: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    marginVertical: 2,
  },
  predUnit: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '700',
  },
  rangeText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  tonnageCol: {
    alignItems: 'flex-end',
  },
  tonnageVal: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    marginVertical: 2,
  },
  shapContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  shapTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f59e0b',
    marginBottom: 6,
  },
  shapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  shapName: {
    fontSize: 11,
    color: '#cbd5e1',
  },
  shapImpact: {
    fontSize: 11,
    fontWeight: '700',
  },
  parcelsContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
  },
  parcelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  selectedParcelItem: {
    borderColor: '#0f172a',
    backgroundColor: '#f1f5f9',
  },
  parcelName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  parcelSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    color: '#64748b',
  },
});
