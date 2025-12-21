# Excel Export Guide for Guest Data

## Overview

This guide explains all columns included in the exported Excel file when you export guest data from the Guest Management page. The export contains comprehensive information about each guest, including their contact details, event invitations, RSVP status, preferences, and access information.

## Export Options

You can export guest data in two ways:
- **Export All Guests**: Exports all guests currently visible (based on your filters)
- **Export Selected Guests**: Exports only the guests you have selected using the checkboxes

Both exports generate an Excel file (`.xlsx` format) with the same column structure.

## Column Reference

The following table describes each column in the exported Excel file:

| Column Name | Data Type | Description | Example Values | Notes |
|-------------|-----------|-------------|----------------|-------|
| **Name** | Text | The full name of the guest | "John Doe", "Jane Smith" | This is the primary identifier for each guest |
| **Phone** | Text | Contact phone number | "+1234567890", "+9876543210" | May be empty if not provided during guest creation |
| **Events** | Text | List of events the guest is invited to | "mehndi; wedding; reception", "reception" | Events are separated by semicolons. Possible events: mehndi, wedding, reception |
| **RSVP Status** | Text | Overall RSVP status across all events | "Attending", "Not Attending", "Pending", "Not Submitted" | Calculated based on individual event RSVPs |
| **Mehndi RSVP** | Text | RSVP status specifically for the Mehndi event | "Attending", "Not Attending", "Pending", "Not Submitted", "N/A" | Shows "N/A" if guest is not invited to this event |
| **Wedding RSVP** | Text | RSVP status specifically for the Wedding event | "Attending", "Not Attending", "Pending", "Not Submitted", "N/A" | Shows "N/A" if guest is not invited to this event |
| **Reception RSVP** | Text | RSVP status specifically for the Reception event | "Attending", "Not Attending", "Pending", "Not Submitted", "N/A" | Shows "N/A" if guest is not invited to this event |
| **Menu Preference** | Text | Dietary preference selected by the guest | "Vegetarian", "Non-Vegetarian", "Both", "" (empty) | Empty if guest has not submitted preferences |
| **Dietary Restrictions** | Text | Any special dietary requirements or restrictions | "No nuts", "Gluten-free", "Lactose intolerant", "" (empty) | Free-form text field; empty if not provided |
| **Additional Info** | Text | Any additional notes or information provided by the guest | "Will arrive late", "Bringing +2 guests", "" (empty) | Free-form text field; empty if not provided |
| **RSVP Submitted At** | Date/Time | Timestamp when the guest submitted their RSVP | "12/25/2024, 3:45:30 PM", "" (empty) | Formatted as local date and time; empty if RSVP not yet submitted |
| **Devices** | Number | Number of devices currently registered/active for this guest | 0, 1, 2, 3 | Represents how many devices have accessed the invitation |
| **Max Devices** | Number | Maximum number of devices allowed for this guest | 1, 5, 10 | Default is 10 if not specified during import |
| **First Access** | Date/Time | When the guest first accessed their invitation link | "12/20/2024, 10:30:15 AM", "Never" | Shows "Never" if the invitation link has not been accessed yet |
| **Created At** | Date/Time | When the guest record was created in the system | "12/15/2024, 2:00:00 PM" | Timestamp of when the guest was added to the database |
| **Invitation Link** | URL | Personalized invitation URL for this guest | "https://example.com/invite/abc123xyz" | Unique link that can be shared with the guest |

## Understanding RSVP Status Values

### Overall RSVP Status
The **RSVP Status** column provides a summary of the guest's response across all events:
- **Attending**: Guest has confirmed attendance for at least one event
- **Not Attending**: Guest has declined all events they're invited to
- **Pending**: Guest has partially responded (some events confirmed, some declined, or mixed responses)
- **Not Submitted**: Guest has not submitted any RSVP responses yet

### Individual Event RSVP Values
Each event-specific RSVP column (Mehndi RSVP, Wedding RSVP, Reception RSVP) can have these values:
- **Attending**: Guest confirmed they will attend this event
- **Not Attending**: Guest confirmed they will not attend this event
- **Pending**: Guest's response is pending or unclear for this event
- **Not Submitted**: Guest has not responded for this event (but is invited)
- **N/A**: Guest is not invited to this event, so RSVP is not applicable

## Understanding Device Information

### Devices vs Max Devices
- **Devices**: The current count of devices that have accessed the invitation. This number increases as guests access the invitation from different devices.
- **Max Devices**: The maximum number of devices allowed for this guest. If the Devices count reaches Max Devices, the guest cannot access the invitation from additional devices without admin intervention.

### First Access
This timestamp indicates when the guest first clicked on their invitation link. If it shows "Never", the invitation has not been opened yet.

## Date and Time Format

All date/time columns are formatted according to your local system settings. The format typically includes:
- Date: Month/Day/Year
- Time: Hours:Minutes:Seconds AM/PM
- Example: "12/25/2024, 3:45:30 PM"

## Using the Exported Data

The exported Excel file can be used for:
- **Event Planning**: Track RSVP responses and attendance
- **Catering**: Use Menu Preference and Dietary Restrictions for meal planning
- **Communication**: Use Phone and Email columns for sending updates
- **Analytics**: Analyze response rates, device usage, and engagement
- **Backup**: Keep a record of all guest information

## Tips for Working with Exported Data

1. **Filtering**: Use Excel's filter feature to quickly find guests by RSVP status, event type, or other criteria
2. **Sorting**: Sort by "RSVP Submitted At" to see who responded first, or by "First Access" to track engagement
3. **Conditional Formatting**: Highlight rows based on RSVP status to quickly visualize attendance
4. **Data Validation**: The Invitation Link column can be used to verify or regenerate links if needed
5. **Reporting**: Use pivot tables to analyze RSVP responses by event or menu preferences

## Notes

- Empty cells indicate that the information was not provided or is not applicable
- All timestamps are in your local timezone
- The Invitation Link is unique to each guest and should be kept secure
- Device counts are updated in real-time as guests access the invitation
- If you need to modify guest data, use the Guest Management interface rather than editing the exported file

