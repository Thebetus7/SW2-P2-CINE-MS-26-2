import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/shared/router/role_router.dart';

void main() {
  group('RoleRouter Unit Tests (HU-01, HU-02 / INV-BIZ-05)', () {
    test('ROLE_GATEKEEPER routes directly to camera scanner (/gatekeeper)', () {
      final route = RoleRouter.evaluateRole([RoleConstants.gatekeeper]);
      expect(route, equals(AppRoutes.gatekeeperScanner));
    });

    test('ROLE_CUSTOMER routes directly to customer home layout (/customer)', () {
      final route = RoleRouter.evaluateRole([RoleConstants.customer]);
      expect(route, equals(AppRoutes.customerHome));
    });

    test('Evaluating by string identifier with portero delegates to gatekeeper camera', () {
      final routePortero = RoleRouter.evaluateSingleRole('ROLE_GATEKEEPER');
      final routeEmail = RoleRouter.evaluateSingleRole('portero@test.com');

      expect(routePortero, equals(AppRoutes.gatekeeperScanner));
      expect(routeEmail, equals(AppRoutes.gatekeeperScanner));
    });

    test('Evaluating customer credentials delegates to customer home layout', () {
      final routeCustomer = RoleRouter.evaluateSingleRole('ROLE_CUSTOMER');
      final routeEmail = RoleRouter.evaluateSingleRole('cliente@test.com');

      expect(routeCustomer, equals(AppRoutes.customerHome));
      expect(routeEmail, equals(AppRoutes.customerHome));
    });

    test('Default fallback without recognized roles defaults safely to customer layout', () {
      final routeEmpty = RoleRouter.evaluateRole([]);
      expect(routeEmpty, equals(AppRoutes.customerHome));
    });
  });
}
