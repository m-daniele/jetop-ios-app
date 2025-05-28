import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 120, // Aggiunto spazio extra per la tabbar
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: { 
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 26,
  },
  inputSection: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 24,
  },
  inputBlurContainer: {
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 40,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    minWidth: 120,
  },
  rollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  resultsSection: {
    marginBottom: 40,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  diceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingBottom: 20, // Aggiunto padding
  },
  diceCard: {
    width: 100,
    height: 100,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  diceGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  diceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  totalSection: {
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  totalText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20, // Aggiunto margin bottom
    letterSpacing: 0.5,
  },
});
