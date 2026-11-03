import 'package:equatable/equatable.dart';

enum ScanFeedbackType { none, permitted, duplicate, invalid }

class ScannerState extends Equatable {
  final bool isScanning;
  final bool isValidating;
  final ScanFeedbackType feedbackType;
  final String? bannerMessage;
  final String? lastScannedTicketId;
  final String? lastRoomName;
  final int attendanceCount;

  const ScannerState({
    this.isScanning = true,
    this.isValidating = false,
    this.feedbackType = ScanFeedbackType.none,
    this.bannerMessage,
    this.lastScannedTicketId,
    this.lastRoomName,
    this.attendanceCount = 0,
  });

  ScannerState copyWith({
    bool? isScanning,
    bool? isValidating,
    ScanFeedbackType? feedbackType,
    String? bannerMessage,
    String? lastScannedTicketId,
    String? lastRoomName,
    int? attendanceCount,
  }) {
    return ScannerState(
      isScanning: isScanning ?? this.isScanning,
      isValidating: isValidating ?? this.isValidating,
      feedbackType: feedbackType ?? this.feedbackType,
      bannerMessage: bannerMessage,
      lastScannedTicketId: lastScannedTicketId ?? this.lastScannedTicketId,
      lastRoomName: lastRoomName ?? this.lastRoomName,
      attendanceCount: attendanceCount ?? this.attendanceCount,
    );
  }

  @override
  List<Object?> get props => [
        isScanning,
        isValidating,
        feedbackType,
        bannerMessage,
        lastScannedTicketId,
        lastRoomName,
        attendanceCount,
      ];
}
