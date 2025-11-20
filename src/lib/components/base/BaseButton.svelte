<script lang="ts">
  /**
   * BaseButton - Einheitliches Button-Styling
   */
  
  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    disabled?: boolean;
    loading?: boolean;
    onclick?: () => void;
    children: any;
  }
  
  let {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    loading = false,
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
  class="btn {variantClass[variant]} {sizeClass[size]} {fullWidth ? 'w-full' : ''} hover:opacity-90 transition-opacity"
  {disabled}
  {onclick}
>
  {#if loading}
    <span class="loading loading-spinner"></span>
  {/if}
  {@render children()}
</button>
