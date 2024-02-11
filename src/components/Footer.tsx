import { component$ } from '@builder.io/qwik';
import { SocialButtons } from './Nav';

export default component$(() => {

  return (
    <footer class="relative flex flex-col gap-2 items-center justify-center w-full z-10 bg-gray-950/40 py-6">
      <div class="flex">
        <SocialButtons />
      </div>
      <span class="text-lg text-gray-300 max-w-6xl text-center">
        Copyright © 2024 Birdflop. All rights reserved. Birdflop is a registered 501(c)(3) nonprofit organization (EIN: 93-2401009).<br/>
        By using this site, you agree to our <a href="/terms" class="text-blue-500">terms of service</a>. Items marked with an asterisk (*) are a reminder that our fair use policy outlined in our terms applies.
      </span>
    </footer>
  );
});