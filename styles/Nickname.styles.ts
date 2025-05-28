import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { 
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    marginTop: 10,
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 26,
  },
  inputSection: {
    marginBottom: 20,
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: { 
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    fontSize: 16,
    color: '#fff',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  resultsSection: {
    marginBottom: 0,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  nicknamesGrid: {
    gap: 8,
  },
  nicknameCard: {
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 24,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedCard: {
    transform: [{ scale: 0.98 }],
  },
  nicknameText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  warningText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 20,
    letterSpacing: 0.5,
  },
  
});