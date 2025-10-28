document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mainNav = document.getElementById('main-nav');

    if (hamburgerBtn && mainNav) {
        const bar1 = document.getElementById('bar1');
        const bar2 = document.getElementById('bar2');
        const bar3 = document.getElementById('bar3');

        hamburgerBtn.addEventListener('click', () => {
            const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
            hamburgerBtn.setAttribute('aria-expanded', !isExpanded);

            // Toggle nav visibility and layout
            mainNav.classList.toggle('hidden');
            mainNav.classList.toggle('flex'); // Make it visible
            mainNav.classList.toggle('flex-col'); // Stack items vertically on mobile
            mainNav.classList.toggle('absolute'); // Position dropdown
            mainNav.classList.toggle('top-full');
            mainNav.classList.toggle('left-0');
            mainNav.classList.toggle('w-full');
            mainNav.classList.toggle('bg-primary-blue');
            mainNav.classList.toggle('shadow-lg');
            mainNav.classList.toggle('py-4');
            mainNav.classList.toggle('space-y-2'); // Add spacing for mobile links

            // Animate hamburger icon
            bar1.classList.toggle('rotate-45');
            bar1.classList.toggle('translate-x-1');
            bar2.classList.toggle('opacity-0');
            bar3.classList.toggle('-rotate-45');
            bar3.classList.toggle('translate-x-1');
        });

        // Handle closing menu on desktop resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) { // Tailwind's 'lg' breakpoint
                mainNav.classList.add('hidden'); // Ensure it's hidden when resizing from mobile
                mainNav.classList.remove('flex', 'flex-col', 'absolute', 'top-full', 'left-0', 'w-full', 'bg-primary-blue', 'shadow-lg', 'py-4', 'space-y-2');
                hamburgerBtn.setAttribute('aria-expanded', 'false');

                // Reset hamburger icon
                bar1.classList.remove('rotate-45', 'translate-x-1');
                bar2.classList.remove('opacity-0');
                bar3.classList.remove('-rotate-45', 'translate-x-1');
            }
        });

        // Optional: Close menu when a nav link is clicked (for single-page navigation or on mobile)
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 1024 && mainNav.classList.contains('flex')) {
                    // Only close if on mobile and menu is open
                    hamburgerBtn.click(); // Simulate click to close and reset icon
                }
            });
        });
    }
});
