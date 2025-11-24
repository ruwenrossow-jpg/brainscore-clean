/**
 * Digital Log API
 * POST /api/digital-log
 * 
 * Speichert kategorienbasiertes ScreenTime-Tracking nach dem Test
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { DigitalLog } from '$features/digitalLog/digitalLogTypes';

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const { supabase } = locals;
    
    // Parse request body
    const body = await request.json();
    const { testId, screenTimeBucket, mainCategories, pickupFrequency } = body as Omit<DigitalLog, 'id' | 'createdAt'>;
    
    // Validation
    if (!testId || !screenTimeBucket || !mainCategories || !pickupFrequency) {
      throw error(400, 'Missing required fields');
    }
    
    if (!Array.isArray(mainCategories) || mainCategories.length === 0 || mainCategories.length > 2) {
      throw error(400, 'mainCategories must be an array with 1-2 items');
    }
    
    // Check if log already exists for this test
    const { data: existingLog } = await supabase
      .from('digital_logs')
      .select('id')
      .eq('test_id', testId)
      .single();
    
    if (existingLog) {
      // Update existing log
      const { error: updateError } = await (supabase
        .from('digital_logs') as any)
        .update({
          screen_time_bucket: screenTimeBucket,
          main_categories: mainCategories,
          pickup_frequency: pickupFrequency,
          updated_at: new Date().toISOString()
        })
        .eq('test_id', testId);
      
      if (updateError) {
        console.error('❌ Digital Log Update Error:', updateError);
        throw error(500, 'Failed to update digital log');
      }
      
      console.log('✅ Digital Log updated for test:', testId);
      return json({ success: true, updated: true });
    } else {
      // Insert new log
      const { error: insertError } = await (supabase
        .from('digital_logs') as any)
        .insert({
          test_id: testId,
          screen_time_bucket: screenTimeBucket,
          main_categories: mainCategories,
          pickup_frequency: pickupFrequency,
          created_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('❌ Digital Log Insert Error:', insertError);
        throw error(500, 'Failed to save digital log');
      }
      
      console.log('✅ Digital Log saved for test:', testId);
      return json({ success: true, created: true });
    }
    
  } catch (err: any) {
    console.error('❌ Digital Log API Error:', err);
    if (err.status) {
      throw err; // Re-throw SvelteKit errors
    }
    throw error(500, 'Internal server error');
  }
};
