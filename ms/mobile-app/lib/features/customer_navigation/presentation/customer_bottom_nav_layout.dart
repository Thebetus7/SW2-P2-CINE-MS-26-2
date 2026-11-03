import 'package:flutter/material.dart';
import '../../../core/database/sqlite_wallet_db.dart';
import '../../../core/theme/app_theme.dart';
import '../../billboard/presentation/billboard_view.dart';
import '../../candy_bar/presentation/candy_catalog_view.dart';
import '../../settings/presentation/settings_view.dart';
import '../../wallet/presentation/wallet_home_view.dart';

/// Layout principal para clientes (ROLE_CUSTOMER)
/// Integra una Bottom Navigation Bar fija con 4 destinos obligatorios:
/// 1. Cartelera (Vista Primaria Obligatoria)
/// 2. Mis Boletos
/// 3. Confitería
/// 4. Configuración
class CustomerBottomNavLayout extends StatefulWidget {
  final SqliteWalletDb? database;
  final String customerEmail;
  final int initialIndex;

  const CustomerBottomNavLayout({
    super.key,
    this.database,
    this.customerEmail = 'cliente@test.com',
    this.initialIndex = 0,
  });

  @override
  State<CustomerBottomNavLayout> createState() => _CustomerBottomNavLayoutState();
}

class _CustomerBottomNavLayoutState extends State<CustomerBottomNavLayout> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  void _onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      const BillboardView(),
      WalletHomeView(
        database: widget.database,
        customerEmail: widget.customerEmail,
      ),
      const CandyCatalogView(),
      SettingsView(userEmail: widget.customerEmail),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: pages,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: _onTabTapped,
        type: BottomNavigationBarType.fixed,
        backgroundColor: AppTheme.surfaceDark,
        selectedItemColor: AppTheme.primaryRed,
        unselectedItemColor: AppTheme.textSecondary,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.movie_creation_outlined),
            activeIcon: Icon(Icons.movie_creation_rounded),
            label: 'Cartelera',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.confirmation_number_outlined),
            activeIcon: Icon(Icons.confirmation_number_rounded),
            label: 'Mis Boletos',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.fastfood_outlined),
            activeIcon: Icon(Icons.fastfood_rounded),
            label: 'Confitería',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings_outlined),
            activeIcon: Icon(Icons.settings_rounded),
            label: 'Configuración',
          ),
        ],
      ),
    );
  }
}
