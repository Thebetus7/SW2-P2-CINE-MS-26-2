import 'package:flutter/material.dart';
import '../../../core/network/api_health_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/router/role_router.dart';
import '../../../shared/widgets/active_module_badge.dart';
import '../../../shared/widgets/health_indicator_chip.dart';

/// Pantalla de inicio de sesión Dark Mode First con credenciales semilla y semáforo de red.
class LoginView extends StatefulWidget {
  final ApiHealthService? healthService;
  final void Function(String role, String email)? onLoginSuccess;

  const LoginView({
    super.key,
    this.healthService,
    this.onLoginSuccess,
  });

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController(text: 'cliente@test.com');
  final _passwordController = TextEditingController(text: 'Password123!');
  bool _obscurePassword = true;
  bool _isLoading = false;

  late final ApiHealthService _healthService;
  ApiHealthState _healthState = ApiHealthState.checking;

  @override
  void initState() {
    super.initState();
    _healthService = widget.healthService ?? ApiHealthService();
    _healthState = _healthService.currentState;
    _healthService.healthStream.listen((state) {
      if (mounted) {
        setState(() => _healthState = state);
      }
    });
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _fillCredentials({required String email, required String password}) {
    setState(() {
      _emailController.text = email;
      _passwordController.text = password;
    });
  }

  void _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    await Future.delayed(const Duration(milliseconds: 300)); // Simulación fluida de autenticación local

    final email = _emailController.text.trim();
    final role = email.contains('portero') ? RoleConstants.gatekeeper : RoleConstants.customer;

    if (mounted) {
      setState(() => _isLoading = false);

      if (widget.onLoginSuccess != null) {
        widget.onLoginSuccess!(role, email);
      } else {
        RoleRouter.navigateByRole(context, role);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cine Center'),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: HealthIndicatorChip(
                state: _healthState,
                onRetry: () => _healthService.checkHealth(),
              ),
            ),
          ),
          const Center(
            child: Padding(
              padding: EdgeInsets.only(right: 12.0),
              child: ActiveModuleBadge(),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 20),
                Center(
                  child: Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryRed.withOpacity(0.15),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.primaryRed, width: 2),
                    ),
                    child: const Icon(
                      Icons.movie_filter_rounded,
                      size: 40,
                      color: AppTheme.primaryRed,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Center(
                  child: Text(
                    'Acceso a Cine Center Mobile',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                const Center(
                  child: Text(
                    'Billetera de Boletos y Control de Acceso',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // Campo Email
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  style: const TextStyle(color: AppTheme.textPrimary),
                  decoration: const InputDecoration(
                    labelText: 'Correo Electrónico',
                    prefixIcon: Icon(Icons.email_outlined, color: AppTheme.textSecondary),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Por favor ingrese su correo electrónico';
                    }
                    if (!value.contains('@')) {
                      return 'Ingrese un formato de correo válido';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Campo Contraseña
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  style: const TextStyle(color: AppTheme.textPrimary),
                  decoration: InputDecoration(
                    labelText: 'Contraseña',
                    prefixIcon: const Icon(Icons.lock_outline, color: AppTheme.textSecondary),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? Icons.visibility_off : Icons.visibility,
                        color: AppTheme.textSecondary,
                      ),
                      onPressed: () {
                        setState(() => _obscurePassword = !_obscurePassword);
                      },
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Por favor ingrese su contraseña';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),

                // Botón Iniciar Sesión
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Iniciar Sesión'),
                ),

                const SizedBox(height: 32),
                const Divider(color: AppTheme.borderDark),
                const SizedBox(height: 16),

                const Text(
                  'Credenciales Semilla de Demostración:',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),

                // Botón Demo Cliente
                OutlinedButton.icon(
                  onPressed: () => _fillCredentials(
                    email: 'cliente@test.com',
                    password: 'Password123!',
                  ),
                  icon: const Icon(Icons.person_outline, color: AppTheme.accentGold, size: 18),
                  label: const Text(
                    'Cargar: cliente@test.com (Cliente)',
                    style: TextStyle(color: AppTheme.textPrimary, fontSize: 13),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppTheme.borderDark),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
                const SizedBox(height: 8),

                // Botón Demo Portero
                OutlinedButton.icon(
                  onPressed: () => _fillCredentials(
                    email: 'portero@test.com',
                    password: 'Password123!',
                  ),
                  icon: const Icon(Icons.qr_code_scanner, color: AppTheme.primaryRed, size: 18),
                  label: const Text(
                    'Cargar: portero@test.com (Portero)',
                    style: TextStyle(color: AppTheme.textPrimary, fontSize: 13),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppTheme.borderDark),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
