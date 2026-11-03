import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/router/role_router.dart';
import '../../../shared/widgets/active_module_badge.dart';

/// Vista de configuración, perfil y preferencias de la aplicación
class SettingsView extends StatelessWidget {
  final String userEmail;

  const SettingsView({
    super.key,
    this.userEmail = 'cliente@test.com',
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Configuración'),
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
          // Tarjeta de perfil
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.cardDark,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppTheme.borderDark),
            ),
            child: Row(
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: const BoxDecoration(
                    color: AppTheme.primaryRed,
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Icon(Icons.person_rounded, color: Colors.white, size: 30),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Cliente Cine Center',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        userEmail,
                        style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceDark,
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: AppTheme.borderDark),
                        ),
                        child: const Text(
                          'Perfil: ROLE_CUSTOMER',
                          style: TextStyle(fontSize: 10, color: AppTheme.accentGold, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Secciones de preferencias
          _buildSectionHeader('Preferencias de Interfaz'),
          _buildSettingsTile(
            icon: Icons.dark_mode_rounded,
            title: 'Tema Visual',
            subtitle: 'Dark Mode First (Predeterminado)',
            trailing: const Switch(value: true, onChanged: null),
          ),
          _buildSettingsTile(
            icon: Icons.cloud_done_rounded,
            title: 'Persistencia Offline',
            subtitle: 'Base de datos SQLite local activa',
            trailing: const Icon(Icons.check_circle_outline, color: AppTheme.statusOnline, size: 20),
          ),

          const SizedBox(height: 20),
          _buildSectionHeader('Información de la Aplicación'),
          _buildSettingsTile(
            icon: Icons.info_outline_rounded,
            title: 'Módulo Autónomo 05',
            subtitle: 'ms/mobile-app • Flutter 3.x & SQLite',
          ),
          _buildSettingsTile(
            icon: Icons.security_rounded,
            title: 'Motor Criptográfico',
            subtitle: 'CryptoQrVerifier HMAC-SHA256 Offline',
          ),

          const SizedBox(height: 32),

          // Botón Cerrar Sesión
          OutlinedButton.icon(
            onPressed: () {
              Navigator.of(context).pushReplacementNamed(AppRoutes.login);
            },
            icon: const Icon(Icons.logout_rounded, color: AppTheme.statusOffline),
            label: const Text(
              'Cerrar Sesión',
              style: TextStyle(color: AppTheme.statusOffline, fontWeight: FontWeight.bold),
            ),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: AppTheme.statusOffline),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0, left: 4),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: AppTheme.textMuted,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildSettingsTile({
    required IconData icon,
    required String title,
    required String subtitle,
    Widget? trailing,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppTheme.cardDark,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppTheme.borderDark),
      ),
      child: ListTile(
        leading: Icon(icon, color: AppTheme.textPrimary, size: 22),
        title: Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
        trailing: trailing,
      ),
    );
  }
}
