<!-- 
  Button Component v1
  
  Referenz: docs/master/design-system.md, Abschnitt "5. Buttons & CTAs"
  
  Einheitliche Button-Komponente mit 3 Varianten:
  - primary: Brand-Purple, Gradient-Shadow, Hover-Lift
  - secondary: Black, Scale-Hover
  - ghost: Transparent, Border, Hover-Purple
  
  Alle Buttons erfüllen:
  - Min. Touch-Target: 44×44px (Accessibility)
  - Focus-States: Ring für Keyboard-Navigation
  - Disabled-States: Opacity 50%, no Hover
-->
<script lang="ts">
  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost' | 'link';
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
  
  // Variant-Mapping zu Tailwind-Klassen (referenziert app.css)
  const variantClasses = {
    primary: 'btn-gradient-primary',
    secondary: 'btn-secondary',
    ghost: 'bg-transparent border-2 border-gray-200 text-gray-700 hover:border-brand-purple hover:text-brand-purple rounded-xl transition-all duration-200 min-h-[44px] px-4 py-2',
    link: 'text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 underline-offset-2 hover:underline min-h-[44px]'
  };
  
  const sizeClasses = {
    sm: 'text-sm px-4 py-2 min-h-[44px]',
    md: 'text-base px-6 py-3 min-h-[44px]',
    lg: 'text-lg px-8 py-4 min-h-[44px]'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';
</script>

<button
  {type}
  class="{variantClasses[variant]} {sizeClasses[size]} {widthClass} {disabledClass} flex items-center justify-center gap-2"
  {disabled}
  onclick={(e) => {
    if (onclick && !disabled && !loading) {
      e.preventDefault();
      e.stopPropagation();
      onclick();
    }
  }}
>
  {#if loading}
    <span class="loading loading-spinner loading-sm"></span>
  {/if}
  {@render children()}
</button>

<style>
  /* Focus-State für Accessibility (Keyboard-Navigation) */
  button:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.3);
  }
  
  /* Disabled-State: No hover-effects */
  button:disabled {
    transform: none !important;
  }
</style>
