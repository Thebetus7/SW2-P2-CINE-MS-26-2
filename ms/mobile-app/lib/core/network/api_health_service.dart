import 'dart:async';
import 'package:http/http.dart' as http;
import 'connectivity_service.dart';

enum ApiHealthState {
  online,
  offline,
  checking,
}

/// Servicio que monitorea la salud del backend y coordina el semáforo de red de la aplicación.
class ApiHealthService {
  final ConnectivityService _connectivityService;
  final http.Client _httpClient;
  final String _healthEndpoint;

  final StreamController<ApiHealthState> _stateController =
      StreamController<ApiHealthState>.broadcast();

  ApiHealthState _currentState = ApiHealthState.checking;
  Timer? _pollingTimer;

  ApiHealthService({
    ConnectivityService? connectivityService,
    http.Client? httpClient,
    String? healthEndpoint,
    bool enablePolling = true,
    bool autoCheck = true,
    ApiHealthState initialState = ApiHealthState.checking,
  })  : _connectivityService = connectivityService ?? ConnectivityService(null, autoCheck),
        _httpClient = httpClient ?? http.Client(),
        _healthEndpoint = healthEndpoint ?? 'http://localhost:8082/actuator/health',
        _currentState = initialState {
    if (autoCheck) {
      _init(enablePolling);
    }
  }

  ApiHealthState get currentState => _currentState;
  Stream<ApiHealthState> get healthStream => _stateController.stream;

  void _init([bool enablePolling = true]) {
    _connectivityService.onConnectivityChanged.listen((hasNetwork) {
      if (!hasNetwork) {
        _updateState(ApiHealthState.offline);
      } else {
        checkHealth();
      }
    });

    // Verificación inicial inmediata
    checkHealth();

    // Sondeo cada 30 segundos si polling está habilitado
    if (enablePolling) {
      _pollingTimer = Timer.periodic(const Duration(seconds: 30), (_) => checkHealth());
    }
  }

  /// Ejecuta comprobación activa de salud
  Future<ApiHealthState> checkHealth() async {
    _updateState(ApiHealthState.checking);

    if (!_connectivityService.isConnected) {
      _updateState(ApiHealthState.offline);
      return ApiHealthState.offline;
    }

    try {
      final response = await _httpClient
          .get(Uri.parse(_healthEndpoint))
          .timeout(const Duration(seconds: 3));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        _updateState(ApiHealthState.online);
        return ApiHealthState.online;
      } else {
        _updateState(ApiHealthState.offline);
        return ApiHealthState.offline;
      }
    } catch (_) {
      // Si la API remota no responde o hay error de socket, se declara offline para operar local
      _updateState(ApiHealthState.offline);
      return ApiHealthState.offline;
    }
  }

  void _updateState(ApiHealthState newState) {
    if (_currentState != newState) {
      _currentState = newState;
      _stateController.add(newState);
    }
  }

  void dispose() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
    _connectivityService.dispose();
    _stateController.close();
  }
}
