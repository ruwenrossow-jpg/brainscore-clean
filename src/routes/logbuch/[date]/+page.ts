/**
 * Load function for day detail page
 */

import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const { date } = params;
  
  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw error(400, 'Invalid date format. Expected YYYY-MM-DD');
  }
  
  // Pass date to page component
  return {
    date
  };
};
