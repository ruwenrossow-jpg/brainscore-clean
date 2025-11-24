<script lang="ts">
  /**
   * Extended Onboarding Wizard Route
   * 
   * NEW: 4-step wizard with goals, contexts, ICS export
   * Replaces simple 2-step onboarding
   */
  import OnboardingWizard from '$features/onboarding/OnboardingWizard.svelte';
</script>

<svelte:head>
  <title>Setup - BrainrotAI</title>
</svelte:head>

<OnboardingWizard />
