<script lang="ts">
  /**
   * BaseButton - Einheitliches Button-Styling
   * 
   * WICHTIG: Unterstützt sowohl Form-Submission als auch Click-Handler
   * - Wenn in <form>: type="submit" für Form-Submission
   * - Wenn onclick gegeben: preventDefault + custom handler
   */
  
  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit';
    onclick?: () => void;
    children: any;
  }
  
  let {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
    type = 'button',
    onclick,
    children
  }: Props = $props();
  
  const variantClass = {
    primary: 'btn-primary text-white',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost'
  };
  
  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  };
</script>

<button
  {type}
  class="btn {variantClass[variant]} {sizeClass[size]} {fullWidth ? 'w-full' : ''} hover:opacity-90 transition-opacity"
  {disabled}
  onclick={(e) => {
    // Nur preventDefault wenn custom onclick handler
    if (onclick) {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !loading) {
        onclick();
      }
    }
    // Sonst: Native Form-Submission (bei type="submit")
  }}
>
  {#if loading}
    <span class="loading loading-spinner"></span>
  {/if}
  {@render children()}
</button>
