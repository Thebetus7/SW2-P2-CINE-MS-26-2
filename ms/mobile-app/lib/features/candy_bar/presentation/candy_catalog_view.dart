import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/active_module_badge.dart';

class CandyItem {
  final String title;
  final String description;
  final String price;
  final IconData icon;

  const CandyItem({
    required this.title,
    required this.description,
    required this.price,
    required this.icon,
  });
}

/// Vista del catálogo de confitería y dulcería
class CandyCatalogView extends StatelessWidget {
  const CandyCatalogView({super.key});

  static const List<CandyItem> combos = [
    CandyItem(
      title: 'Combo Dúo Palomitas',
      description: '1 Canasta de palomitas gigante + 2 refrescos medianos de máquina.',
      price: '\$14.50',
      icon: Icons.fastfood_rounded,
    ),
    CandyItem(
      title: 'Combo Nachos Supreme',
      description: 'Nachos con extra queso cheddar caliente, jalapeños + 1 refresco grande.',
      price: '\$11.00',
      icon: Icons.lunch_dining_rounded,
    ),
    CandyItem(
      title: 'Combo Hot Dog Cine',
      description: 'Hot Dog con aderezos especiales + Papas fritas + 1 refresco mediano.',
      price: '\$9.75',
      icon: Icons.breakfast_dining_rounded,
    ),
    CandyItem(
      title: 'Canasta Popcorn Mantequilla',
      description: 'Palomitas recién horneadas con mantequilla líquida original.',
      price: '\$6.50',
      icon: Icons.takeout_dining_rounded,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Confitería Cine Center'),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 12.0),
            child: ActiveModuleBadge(),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.cardDark,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.borderDark),
            ),
            child: const Row(
              children: [
                Icon(Icons.qr_code_2_rounded, color: AppTheme.accentGold, size: 32),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Presenta el QR de Confitería de tu boleto en el mostrador para canjear tus combos comprados.',
                    style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Combos Populares',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
          ),
          const SizedBox(height: 12),
          ...combos.map((combo) => _buildComboCard(combo)),
        ],
      ),
    );
  }

  Widget _buildComboCard(CandyItem combo) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.borderDark),
      ),
      child: Row(
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: AppTheme.surfaceDark,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppTheme.borderDark),
            ),
            child: Icon(combo.icon, color: AppTheme.accentGold, size: 28),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  combo.title,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  combo.description,
                  style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Text(
            combo.price,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppTheme.primaryRed,
            ),
          ),
        ],
      ),
    );
  }
}
