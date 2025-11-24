/**
 * ICS Calendar Export API
 * 
 * Generates .ics file for tracking context reminders
 * 
 * POST /api/ics
 * Body: { trackingContexts: TrackingContext[] }
 * Returns: text/calendar (.ics file)
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { TrackingContext } from '$features/onboarding/onboardingTypes';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { trackingContexts } = await request.json();
    
    if (!trackingContexts || !Array.isArray(trackingContexts) || trackingContexts.length === 0) {
      return json({ error: 'Invalid tracking contexts' }, { status: 400 });
    }
    
    const icsContent = generateICS(trackingContexts as TrackingContext[]);
    
    return new Response(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="brainscore-reminders.ics"'
      }
    });
  } catch (error) {
    console.error('ICS generation error:', error);
    return json({ error: 'Failed to generate ICS file' }, { status: 500 });
  }
};

/**
 * Generate ICS file content
 */
function generateICS(contexts: TrackingContext[]): string {
  const now = new Date();
  const prodId = '-//BrainrotAI//Brainrot-SART Reminders//EN';
  
  // ICS header
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${prodId}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:BrainrotAI Check-ins',
    'X-WR-TIMEZONE:Europe/Berlin',
    'X-WR-CALDESC:Erinnerungen für deine BrainrotAI Aufmerksamkeitstests'
  ].join('\r\n');
  
  // Generate events for each context
  contexts.forEach((context, index) => {
    const event = generateEvent(context, now, index);
    ics += '\r\n' + event;
  });
  
  // ICS footer
  ics += '\r\nEND:VCALENDAR';
  
  return ics;
}

/**
 * Generate single VEVENT
 */
function generateEvent(context: TrackingContext, startDate: Date, index: number): string {
  const uid = `${context.id}@brainscore.app`;
  const dtstamp = formatICSDate(new Date());
  
  // Calculate start datetime (today at context.time)
  const [hours, minutes] = context.time.split(':').map(Number);
  const eventStart = new Date(startDate);
  eventStart.setHours(hours, minutes, 0, 0);
  
  // If time already passed today, start tomorrow
  if (eventStart < new Date()) {
    eventStart.setDate(eventStart.getDate() + 1);
  }
  
  const dtstart = formatICSDate(eventStart);
  
  // Event duration: 5 minutes (enough time to complete test)
  const eventEnd = new Date(eventStart);
  eventEnd.setMinutes(eventEnd.getMinutes() + 5);
  const dtend = formatICSDate(eventEnd);
  
  // Recurrence rule: Daily for 30 days
  const rrule = 'FREQ=DAILY;COUNT=30';
  
  // Alarm: 5 minutes before
  const alarm = [
    'BEGIN:VALARM',
    'TRIGGER:-PT5M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Gleich: ${context.label}`,
    'END:VALARM'
  ].join('\r\n');
  
  return [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:Brainrot-Check: ${context.label}`,
    `DESCRIPTION:Zeit für deinen Aufmerksamkeitstest im Kontext "${context.label}". Öffne BrainrotAI und starte den Test.`,
    `LOCATION:BrainrotAI App`,
    `RRULE:${rrule}`,
    `STATUS:CONFIRMED`,
    `SEQUENCE:0`,
    alarm,
    'END:VEVENT'
  ].join('\r\n');
}

/**
 * Format date to ICS format (YYYYMMDDTHHmmss)
 */
function formatICSDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join('');
}
