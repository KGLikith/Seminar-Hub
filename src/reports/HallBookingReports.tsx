import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
    paddingBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  hallDetailsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  detailLabel: {
    width: "30%",
    fontWeight: "bold",
    color: "#374151",
  },
  detailValue: {
    width: "70%",
    color: "#1f2937",
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1d4ed8",
  },
  tableContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#1f2937",
    fontWeight: "bold",
    backgroundColor: "#f3f4f6",
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    minHeight: 45,
    paddingVertical: 8,
  },
  colDate: {
    width: "12%",
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  colTime: {
    width: "15%",
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  colTeacher: {
    width: "16%",
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  colEmail: {
    width: "20%",
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  colStatus: {
    width: "12%",
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },
  colPurpose: {
    width: "25%",
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  cellText: {
    fontSize: 8,
    color: "#374151",
    lineHeight: 1.3,
  },
  headerText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1f2937",
  },
  emptyState: {
    marginTop: 12,
    paddingVertical: 16,
    textAlign: "center",
    color: "#6b7280",
  },
  footer: {
    marginTop: 40,
    fontSize: 8,
    textAlign: "center",
    color: "#6b7280",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
  },
})

export default function HallBookingReportPDF({ hall }: { hall: any }) {
  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Hall Booking Report</Text>

        {/* Hall Info */}
        <View style={styles.section}>
          <Text style={styles.label}>Hall Details</Text>
          <View style={styles.hallDetailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{hall.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>{hall.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Department:</Text>
              <Text style={styles.detailValue}>{hall.department?.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Seating Capacity:</Text>
              <Text style={styles.detailValue}>{hall.seating_capacity}</Text>
            </View>
          </View>
        </View>

        {/* Booking Table */}
        <View style={styles.section}>
          <Text style={styles.label}>Booking History</Text>

          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.colDate, styles.headerText]}>Date</Text>
              <Text style={[styles.colTime, styles.headerText]}>Time</Text>
              <Text style={[styles.colTeacher, styles.headerText]}>
                Teacher
              </Text>
              <Text style={[styles.colEmail, styles.headerText]}>Email</Text>
              <Text style={[styles.colStatus, styles.headerText]}>Status</Text>
              <Text style={[styles.colPurpose, styles.headerText]}>
                Purpose
              </Text>
            </View>

            {hall.bookings.length === 0 && (
              <Text style={styles.emptyState}>
                No bookings found for this hall.
              </Text>
            )}

            {hall.bookings.map((b: any) => (
              <View key={b.id} style={styles.tableRow}>
                <View style={styles.colDate}>
                  <Text style={styles.cellText}>
                    {new Date(b.booking_date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.colTime}>
                  <Text style={styles.cellText}>
                    {new Date(b.start_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    –{" "}
                    {new Date(b.end_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                <View style={styles.colTeacher}>
                  <Text style={styles.cellText}>{b.teacher.name}</Text>
                </View>
                <View style={styles.colEmail}>
                  <Text style={styles.cellText}>{b.teacher.email}</Text>
                </View>
                <View style={styles.colStatus}>
                  <Text style={styles.cellText}>{b.status}</Text>
                </View>
                <View style={styles.colPurpose}>
                  <Text style={styles.cellText}>{b.purpose}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>
          Generated on {new Date().toLocaleString()}
        </Text>
      </Page>
    </Document>
  )
}
