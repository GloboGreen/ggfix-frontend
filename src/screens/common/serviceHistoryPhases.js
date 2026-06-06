// Shop-side booking Service History timeline.
//
// One source of truth for the 16 statuses the shop / owner / customer /
// technician views all render in the same order. Each render row maps to
// exactly one row in `repair_booking_events.status` — no nested phases, no
// duplicates. Backend emit code writes these status keys verbatim.
import React from 'react';
import { Text, View } from 'react-native';

export const SHOP_BOOKING_STATUS_OPTIONS = [
  { value: 'BOOKING_CREATED_BY_SHOP',                       label: 'Booking Created by Shop' },
  { value: 'SERVICE_ACCEPTED',                              label: 'Service Accepted' },
  { value: 'ASSIGNED_TO_TECHNICIAN',                        label: 'Assigned to Technician' },
  { value: 'AWAITING_TECHNICIAN_ACCEPTANCE',                label: 'Awaiting Technician Acceptance' },
  { value: 'REASSIGNED_TO_TECHNICIAN',                      label: 'Re-Assign to Technician' },
  { value: 'TECHNICIAN_ACCEPTED_SERVICE',                   label: 'Technician Accepted Service' },
  { value: 'TECHNICIAN_WORK_STARTED',                       label: 'Technician Work Started' },
  { value: 'TECHNICIAN_UPLOADED_DEVICE_IMAGES',             label: 'Technician Uploaded Device Images' },
  { value: 'TECHNICIAN_COMPLIANCE_ISSUE_VERIFIED_UPDATED',  label: 'Technician Compliance Issue Verified & Updated' },
  { value: 'RE_ESTIMATED_CONFIRMED',                        label: 'Re-Estimated Confirmed' },
  { value: 'CUSTOMER_APPROVED',                             label: 'Customer Approved' },
  { value: 'CUSTOMER_REJECTED',                             label: 'Customer Rejected' },
  { value: 'IN_REPAIR',                                     label: 'Repair Work In Progress' },
  { value: 'PARTS_REQUIRED',                                label: 'Parts Required' },
  { value: 'PARTS_REPLACED',                                label: 'Parts Replaced' },
  { value: 'QUALITY_CHECK_STARTED',                         label: 'Quality Check Started' },
  { value: 'QUALITY_CHECK_COMPLETED',                       label: 'Quality Check Completed' },
  { value: 'REPAIR_COMPLETED',                              label: 'Repair Completed' },
  { value: 'READY',                                         label: 'Ready for Delivery' },
  { value: 'DELIVERED',                                     label: 'Delivered to Customer' },
  { value: 'CANCELLED',                                     label: 'Work Cancelled' },
];

const LABEL_BY_KEY = Object.fromEntries(
  SHOP_BOOKING_STATUS_OPTIONS.map((o) => [o.value, o.label]),
);

const SUCCESS = '#10B981';      // green dot / line for completed steps
const DOT_BORDER = '#CBD5E1';   // gray ring around upcoming steps
const LINE_PENDING = '#E2E8F0'; // connector between unreached steps

function fmt(v) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: '2-digit', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

/**
 * Render the shop-side booking timeline.
 *
 * Caller passes the events list ({ status, note, createdAt, actor }) and the
 * booking's current macro-status. Each of the 16 fixed rows lights up green
 * when a matching event exists OR the booking's macro-status has reached that
 * step. The most-recent completed step gets the "NOW" badge.
 */
export function ServiceHistoryTimeline({ events, status }) {
  // Index events by status key. Keep the FIRST occurrence so the displayed
  // timestamp is when that state was entered, not when it was re-emitted.
  const eventByStatus = {};
  (events || []).forEach((e) => {
    const k = (e.status || '').toUpperCase();
    if (!eventByStatus[k]) eventByStatus[k] = e;
  });

  // A step is "completed" iff a matching event row exists. The "current"
  // step (NOW badge) is the event with the most recent createdAt — not the
  // highest fixed-list index — so the latest action the technician took
  // gets the indicator, even when an auto-emitted macro-status event like
  // IN_REPAIR sits further down the list.
  const sortedByTime = (events || []).slice().sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  );
  const latestKey = (sortedByTime[0]?.status || '').toUpperCase();
  let currentIndex = SHOP_BOOKING_STATUS_OPTIONS.findIndex((o) => o.value === latestKey);
  if (currentIndex < 0) {
    // Latest event isn't in the canonical list — fall back to the highest
    // indexed step that does have an event so we still mark something current.
    SHOP_BOOKING_STATUS_OPTIONS.forEach((opt, i) => {
      if (eventByStatus[opt.value]) currentIndex = i;
    });
  }

  return (
    <View>
      {SHOP_BOOKING_STATUS_OPTIONS.map((opt, i) => {
        const ev = eventByStatus[opt.value];
        const completed = !!ev;
        const isCurrent = i === currentIndex && completed;
        const isLast = i === SHOP_BOOKING_STATUS_OPTIONS.length - 1;
        // Connector to the next step lights up only when BOTH the current
        // step and the next step are completed — a gap in events shows as a
        // gray segment, not as a green bar passing through nothing.
        const nextOpt = SHOP_BOOKING_STATUS_OPTIONS[i + 1];
        const nextCompleted = nextOpt ? !!eventByStatus[nextOpt.value] : false;
        const lineCompleted = completed && nextCompleted;
        return (
          <View key={opt.value} className="flex-row">
            <View className="items-center mr-3" style={{ width: 18 }}>
              <View
                style={{
                  width: 14, height: 14, borderRadius: 7,
                  backgroundColor: completed ? SUCCESS : '#FFFFFF',
                  borderWidth: completed ? 0 : 2, borderColor: DOT_BORDER,
                  marginTop: 2,
                }}
              />
              {!isLast ? (
                <View
                  className="flex-1 my-1"
                  style={{ width: 2, backgroundColor: lineCompleted ? SUCCESS : LINE_PENDING }}
                />
              ) : null}
            </View>
            <View className="flex-1 pb-4">
              <View className="flex-row items-center justify-between">
                <Text
                  className={`text-[13px] flex-1 pr-2 ${
                    completed ? 'font-extrabold text-text' : 'font-bold text-text-muted'
                  }`}
                >
                  {opt.label}
                </Text>
                {isCurrent ? (
                  <View className="bg-success/15 rounded-full px-1.5 py-0.5 ml-1">
                    <Text className="text-[8px] font-extrabold text-success">NOW</Text>
                  </View>
                ) : null}
              </View>
              {ev?.createdAt ? (
                <Text className="text-[10px] text-text-muted mt-1">{fmt(ev.createdAt)}</Text>
              ) : null}
              {ev?.note && ev.note !== opt.label ? (
                <Text className="text-[11px] text-text mt-0.5">{ev.note}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/**
 * Plain-text label of the booking's current step — used by the order
 * summary cards that need a one-line status without rendering the rail.
 */
export function getCurrentPhaseLabel(events, status) {
  const sorted = (events || []).slice().sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  );
  const latest = sorted[0];
  const key = (latest?.status || '').toUpperCase();
  if (LABEL_BY_KEY[key]) return LABEL_BY_KEY[key];
  const statusUpper = (status || '').toUpperCase();
  if (LABEL_BY_KEY[statusUpper]) return LABEL_BY_KEY[statusUpper];
  return latest?.note || (status || '').replace(/_/g, ' ');
}
