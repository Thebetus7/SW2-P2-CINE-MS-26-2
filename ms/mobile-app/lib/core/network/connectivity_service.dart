import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';

/// Servicio para detectar reactivamente el estado de la conexión física a internet.
class ConnectivityService {
  final Connectivity _connectivity;
  final StreamController<bool> _controller = StreamController<bool>.broadcast();

  bool _isConnected = true;

  ConnectivityService([Connectivity? connectivity, bool autoInit = true])
      : _connectivity = connectivity ?? Connectivity() {
    if (autoInit) {
      _init();
    }
  }

  bool get isConnected => _isConnected;
  Stream<bool> get onConnectivityChanged => _controller.stream;

  void _init() {
    try {
      _connectivity.onConnectivityChanged.listen(_updateConnectionStatus);
      checkConnectivity();
    } catch (_) {
      // Ignorar excepciones de canales de plataforma en entornos de testing
    }
  }

  Future<bool> checkConnectivity() async {
    try {
      final results = await _connectivity.checkConnectivity();
      final connected = _hasConnection(results);
      _isConnected = connected;
      _controller.add(connected);
      return connected;
    } catch (_) {
      _isConnected = false;
      _controller.add(false);
      return false;
    }
  }

  void _updateConnectionStatus(List<ConnectivityResult> results) {
    final connected = _hasConnection(results);
    if (_isConnected != connected) {
      _isConnected = connected;
      _controller.add(connected);
    }
  }

  bool _hasConnection(List<ConnectivityResult> results) {
    if (results.isEmpty) return false;
    return results.any((r) =>
        r == ConnectivityResult.mobile ||
        r == ConnectivityResult.wifi ||
        r == ConnectivityResult.ethernet);
  }

  void dispose() {
    _controller.close();
  }
}
