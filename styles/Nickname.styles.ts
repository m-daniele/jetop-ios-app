import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingTop: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { 
    fontSize: 28,
    marginTop: 30,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: { 
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    fontSize: 15,
    color: '#fff',
    minHeight: 90,
    textAlignVertical: 'top',
  },
  resultsSection: {
    marginBottom: 0,
    padding: 12,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 30,
    marginTop: -8,
    letterSpacing: -0.5,
    marginLeft:18,
  },
  nicknamesGrid: {
    gap: 10,
  },
  nicknameCard: {
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 18,
    marginBottom: 4,
    marginStart: 16,
    marginEnd: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    transform: [{ scale: 0.98 }],
  },
  nicknameText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  warningText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 15,
    letterSpacing: 0.5,
  },
});