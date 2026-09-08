import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0E0E0E',
  secondary: '#1A1A18',
  gold: '#C9A24A',
  text: '#F5F1EA',
  textSecondary: '#8E877C',
};

type Screen = 'menu' | 'detail' | 'cart' | 'tracking' | 'reserve' | 'branches';

export default function AlKhanApp() {
  const [activeScreen, setActiveScreen] = useState<Screen>('menu');
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'reserve' | 'branches' | 'account'>('menu');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'menu':
        return <MenuScreen onSelectItem={() => setActiveScreen('detail')} />;
      case 'detail':
        return <ItemDetailScreen onBack={() => setActiveScreen('menu')} onAddCart={() => setActiveScreen('cart')} />;
      case 'cart':
        return <CartScreen onBack={() => setActiveScreen('menu')} />;
      case 'tracking':
        return <TrackingScreen onBack={() => setActiveScreen('menu')} />;
      case 'reserve':
        return <ReservationScreen onBack={() => setActiveScreen('menu')} />;
      case 'branches':
        return <BranchesScreen />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        {renderScreen()}
        <View style={styles.tabBar}>
          <TabBarItem icon="🍽️" label="Menu" active={activeTab === 'menu'} onPress={() => { setActiveTab('menu'); setActiveScreen('menu'); }} />
          <TabBarItem icon="📋" label="Orders" active={activeTab === 'orders'} onPress={() => { setActiveTab('orders'); setActiveScreen('tracking'); }} />
          <TabBarItem icon="📅" label="Reserve" active={activeTab === 'reserve'} onPress={() => { setActiveTab('reserve'); setActiveScreen('reserve'); }} />
          <TabBarItem icon="📍" label="Branches" active={activeTab === 'branches'} onPress={() => { setActiveTab('branches'); setActiveScreen('branches'); }} />
          <TabBarItem icon="👤" label="Account" active={activeTab === 'account'} onPress={() => setActiveTab('account')} />
        </View>
      </SafeAreaView>
    </View>
  );
}

function MenuScreen({ onSelectItem }: { onSelectItem: () => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>ALKHAN</Text>
          <Text style={styles.location}>📍 Gulberg III</Text>
        </View>
        <Text style={styles.icon}>🔔</Text>
      </View>

      <View style={styles.searchBox}>
        <Text>🔍 Search 150+ dishes</Text>
      </View>

      <View style={styles.promoBox}>
        <View style={styles.promoContent}>
          <Text style={styles.promoTitle}>App-only: 15% off first order</Text>
          <Text style={styles.promoCode}>Code ALKHAN15</Text>
        </View>
        <Text>✕</Text>
      </View>

      <View style={styles.categoryChips}>
        <Chip label="All" active />
        <Chip label="Pakistani" />
        <Chip label="Chinese" />
        <Chip label="BBQ" />
      </View>

      <SectionHeader title="FEASTS & PLATTERS" />
      <MenuItem name="Desi Profusion" price="Rs 4,250" desc="Serves 4 · Mixed grill, karahi, naan" onPress={onSelectItem} />

      <SectionHeader title="POPULAR NOW" />
      <MenuItem name="Mutton Majesta" price="Rs 1,850" desc="Slow-cooked, whole spice" onPress={onSelectItem} />
      <MenuItem name="The Grand Arabia" price="Rs 3,100" desc="Arabian mixed platter" onPress={onSelectItem} />
    </ScrollView>
  );
}

function ItemDetailScreen({ onBack, onAddCart }: { onBack: () => void; onAddCart: () => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.itemImage}>
        <Text style={{ fontSize: 26 }}>🍖</Text>
      </View>

      <View style={styles.itemHeader}>
        <View>
          <Text style={styles.itemName}>Mutton Majesta</Text>
          <Text style={styles.itemDesc}>Slow-cooked mutton in whole spices, finished on the tandoor. A Masterchef signature since 1991.</Text>
        </View>
        <Text style={styles.price}>Rs 1,850</Text>
      </View>

      <SectionHeader title="SPICE LEVEL" />
      <View style={styles.optionsRow}>
        <Chip label="Mild" />
        <Chip label="Medium" active />
        <Chip label="Hot" />
      </View>

      <SectionHeader title="PORTION" />
      <View style={styles.optionsRow}>
        <Chip label="Half · Rs 1,850" active />
        <Chip label="Full · Rs 3,400" />
      </View>

      <SectionHeader title="ADD TO THIS" />
      <OptionRow label="Garlic naan ×2" price="Rs 160" />
      <OptionRow label="Raita" price="Rs 120" />

      <TouchableOpacity style={styles.addButton} onPress={onAddCart}>
        <Text style={styles.addButtonText}>Add · Rs 1,850</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function CartScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <View style={styles.cartHeader}>
        <Text style={styles.cartTitle}>Your order</Text>
        <Text style={styles.cartCount}>3 items</Text>
      </View>

      <CartItem name="Mutton Majesta" desc="Medium · Half · +Naan ×2" price="2,010" />
      <CartItem name="Chicken Chowmein" desc="Regular" price="890" />

      <SectionHeader title="CHECKOUT" />
      <CheckoutRow icon="📍" label="Home · DHA Phase 5" />
      <CheckoutRow icon="🏪" label="Gulberg III · 4.2 km" />
      <CheckoutRow icon="⏰" label="Now · 35–45 min" />
      <CheckoutRow icon="💳" label="Cash on delivery" />

      <View style={styles.priceBreakdown}>
        <Text style={styles.priceSmall}>Subtotal · delivery · tax</Text>
        <Text style={styles.priceSmall}>2,900 · 150 · 464</Text>
      </View>

      <View style={styles.cartBottom}>
        <View>
          <Text style={styles.priceSmall}>Total</Text>
          <Text style={styles.totalPrice}>Rs 3,514</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Place order</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onBack} style={styles.backButtonFull}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function TrackingScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <View style={styles.trackingHeader}>
        <TouchableOpacity onPress={onBack}>
          <Text>←</Text>
        </TouchableOpacity>
        <Text style={styles.orderNumber}>Order #A-4471</Text>
        <Text>☎️</Text>
      </View>

      <View style={styles.mapBox}>
        <Text style={{ fontSize: 24 }}>🗺️</Text>
      </View>

      <Text style={styles.eta}>Arriving 8:42 PM</Text>
      <Text style={styles.riderInfo}>Rider Bilal is 1.8 km away</Text>

      <TrackingStep status="✓" title="Order confirmed" time="8:04 PM · Gulberg III" />
      <TrackingStep status="✓" title="Preparing in kitchen" time="8:09 PM" />
      <TrackingStep status="✓" title="Out for delivery" time="8:28 PM" />
      <TrackingStep status="○" title="Delivered" time="Estimated 8:42 PM" />

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.outlineButton}>
          <Text style={styles.outlineButtonText}>Call rider</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineButton}>
          <Text style={styles.outlineButtonText}>Help</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function ReservationScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <View style={styles.reservationHeader}>
        <TouchableOpacity onPress={onBack}>
          <Text>←</Text>
        </TouchableOpacity>
        <Text style={styles.reserveTitle}>Reserve a table</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressSegment, { backgroundColor: COLORS.gold }]} />
        <View style={[styles.progressSegment, { backgroundColor: COLORS.gold }]} />
        <View style={[styles.progressSegment, { backgroundColor: COLORS.secondary }]} />
      </View>

      <SectionHeader title="BRANCH" />
      <View style={styles.selectedBox}>
        <Text style={styles.selectedText}>Gulberg III · MM Alam Rd</Text>
        <Text>✓</Text>
      </View>

      <SectionHeader title="DATE" />
      <View style={styles.dateChips}>
        <Chip label="Thu 3" />
        <Chip label="Fri 4" active />
        <Chip label="Sat 5" />
        <Chip label="Sun 6" />
      </View>

      <SectionHeader title="TIME" />
      <View style={styles.timeChips}>
        <Chip label="7:00" />
        <Chip label="7:30" />
        <Chip label="8:00" active />
        <Chip label="8:30" />
        <Chip label="9:00" />
      </View>

      <SectionHeader title="PARTY SIZE" />
      <View style={styles.sizeChips}>
        <Chip label="2" />
        <Chip label="3" />
        <Chip label="4" active />
        <Chip label="6" />
        <Chip label="8+" />
      </View>

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>Confirm · Fri 4, 8:00 PM</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function BranchesScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <View style={styles.branchesHeader}>
        <Text style={styles.branchesTitle}>5 branches in Lahore</Text>
        <Text>🗺️</Text>
      </View>

      <BranchCard name="Gulberg III" distance="4.2 km" address="Umar Saeed Rd, MM Alam · Open now" />
      <BranchCard name="Bahria Town" distance="11.6 km" address="Canal Rd, Sector B · Open now" />
      <BranchCard name="Shahdara" distance="18.4 km" address="Where it began, 1991" />
    </ScrollView>
  );
}

// UI Components
function Chip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <View style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function MenuItem({ name, price, desc, onPress }: { name: string; price: string; desc: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemImage}>
        <Text style={{ fontSize: 18 }}>🍖</Text>
      </View>
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemHeader}>
          <Text style={styles.menuItemName}>{name}</Text>
          <Text style={styles.price}>{price}</Text>
        </View>
        <Text style={styles.menuItemDesc}>{desc}</Text>
      </View>
    </TouchableOpacity>
  );
}

function OptionRow({ label, price }: { label: string; price: string }) {
  return (
    <View style={styles.optionRow}>
      <Text style={styles.optionLabel}>{label}</Text>
      <Text style={styles.price}>{price}</Text>
    </View>
  );
}

function CartItem({ name, desc, price }: { name: string; desc: string; price: string }) {
  return (
    <View style={styles.cartItem}>
      <View style={styles.cartItemImage}>
        <Text style={{ fontSize: 14 }}>🍖</Text>
      </View>
      <View style={styles.cartItemContent}>
        <Text style={styles.itemName}>{name}</Text>
        <Text style={styles.itemDesc}>{desc}</Text>
      </View>
      <Text style={styles.price}>{price}</Text>
    </View>
  );
}

function CheckoutRow({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.checkoutRow}>
      <Text>{icon} {label}</Text>
      <Text>⋯</Text>
    </View>
  );
}

function TrackingStep({ status, title, time }: { status: string; title: string; time: string }) {
  return (
    <View style={styles.trackingStep}>
      <Text style={styles.stepStatus}>{status}</Text>
      <View>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepTime}>{time}</Text>
      </View>
    </View>
  );
}

function BranchCard({ name, distance, address }: { name: string; distance: string; address: string }) {
  return (
    <View style={styles.branchCard}>
      <View style={styles.branchImage}>
        <Text style={{ fontSize: 18 }}>🏪</Text>
      </View>
      <View style={styles.branchContent}>
        <View style={styles.branchHeader}>
          <Text style={styles.branchName}>{name}</Text>
          <Text style={styles.price}>{distance}</Text>
        </View>
        <Text style={styles.branchAddress}>{address}</Text>
        <View style={styles.branchActions}>
          <Text style={styles.action}>📍 Directions</Text>
          <Text style={styles.action}>☎️ Call</Text>
          <Text style={styles.action}>📅 Reserve</Text>
        </View>
      </View>
    </View>
  );
}

function TabBarItem({ icon, label, active, onPress }: { icon: string; label: string; active?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.tabBarItem} onPress={onPress}>
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  screenContent: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(245,241,234,.14)',
  },
  brand: {
    fontSize: 10,
    letterSpacing: 0.14,
    color: COLORS.gold,
    fontWeight: '600',
  },
  location: {
    fontSize: 12,
    marginTop: 3,
    color: COLORS.text,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    padding: 10,
    margin: 14,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  promoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    padding: 11,
    marginHorizontal: 14,
    marginBottom: 12,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.text,
  },
  promoCode: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  categoryChips: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    marginBottom: 12,
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(245,241,234,.14)',
    backgroundColor: 'transparent',
  },
  chipActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  chipText: {
    fontSize: 10,
    color: '#B7B0A4',
  },
  chipTextActive: {
    color: '#2A2007',
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 9,
    letterSpacing: 0.14,
    color: COLORS.textSecondary,
    marginHorizontal: 14,
    marginVertical: 12,
    marginTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    overflow: 'hidden',
  },
  menuItemImage: {
    width: 60,
    height: 60,
    backgroundColor: '#232320',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  menuItemContent: {
    flex: 1,
    paddingVertical: 10,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  menuItemName: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
  },
  menuItemDesc: {
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
  price: {
    fontSize: 11,
    color: COLORS.gold,
    fontWeight: '500',
  },
  itemImage: {
    height: 150,
    backgroundColor: '#232320',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 10,
  },
  itemHeader: {
    paddingHorizontal: 14,
    marginTop: 12,
    marginBottom: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 5,
  },
  itemDesc: {
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
  optionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    marginBottom: 12,
    gap: 6,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(245,241,234,.07)',
    color: COLORS.text,
  },
  optionLabel: {
    fontSize: 11,
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 8,
    padding: 12,
    margin: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#2A2007',
    fontSize: 12,
    fontWeight: '500',
  },
  backButton: {
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  backButtonText: {
    color: COLORS.gold,
    fontSize: 14,
  },
  backButtonFull: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    marginBottom: 12,
    fontSize: 12,
  },
  cartTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  cartCount: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  cartItem: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(245,241,234,.07)',
    alignItems: 'center',
  },
  cartItemImage: {
    width: 40,
    height: 40,
    backgroundColor: '#232320',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  cartItemContent: {
    flex: 1,
  },
  checkoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(245,241,234,.07)',
    fontSize: 11,
    color: COLORS.text,
  },
  priceBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(245,241,234,.07)',
  },
  priceSmall: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  cartBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(245,241,234,.10)',
    marginTop: 4,
    gap: 8,
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(245,241,234,.14)',
  },
  orderNumber: {
    fontSize: 12,
    color: COLORS.text,
  },
  mapBox: {
    height: 118,
    backgroundColor: '#232320',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 14,
    marginVertical: 14,
    borderRadius: 10,
  },
  eta: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    paddingHorizontal: 14,
  },
  riderInfo: {
    fontSize: 10,
    color: COLORS.textSecondary,
    paddingHorizontal: 14,
    marginTop: 3,
    marginBottom: 14,
  },
  trackingStep: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  stepStatus: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.gold,
    width: 20,
    marginTop: 2,
  },
  stepTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.text,
  },
  stepTime: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  outlineButton: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(245,241,234,.22)',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  outlineButtonText: {
    fontSize: 11,
    color: COLORS.text,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(245,241,234,.14)',
  },
  reserveTitle: {
    fontSize: 12,
    color: COLORS.text,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  progressSegment: {
    flex: 1,
    height: 2,
  },
  selectedBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 10,
    marginHorizontal: 14,
    marginBottom: 12,
  },
  selectedText: {
    fontSize: 12,
    color: COLORS.text,
  },
  dateChips: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    marginBottom: 12,
    gap: 6,
  },
  timeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    marginBottom: 12,
    gap: 6,
    rowGap: 8,
  },
  sizeChips: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    marginBottom: 12,
    gap: 6,
  },
  branchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(245,241,234,.14)',
  },
  branchesTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  branchCard: {
    overflow: 'hidden',
    borderRadius: 10,
    marginHorizontal: 14,
    marginBottom: 11,
  },
  branchImage: {
    height: 74,
    backgroundColor: '#232320',
    justifyContent: 'center',
    alignItems: 'center',
  },
  branchContent: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  branchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  branchName: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
  },
  branchAddress: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  branchActions: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 8,
    fontSize: 10,
  },
  action: {
    fontSize: 10,
    color: COLORS.gold,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 9,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(245,241,234,.10)',
    backgroundColor: COLORS.bg,
  },
  tabBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabIcon: {
    fontSize: 17,
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
  },
  tabLabelActive: {
    color: COLORS.gold,
  },
  icon: {
    fontSize: 17,
    color: COLORS.textSecondary,
  },
});
