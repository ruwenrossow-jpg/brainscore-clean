/**
 * Test Route Server Load
 * Provides userId for insight service
 */

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  // Auth guard
  if (!session?.user) {
    throw redirect(303, '/auth');
  }
  
  return {
    userId: session.user.id
  };
};
