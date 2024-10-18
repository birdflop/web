import { component$, Slot } from '@builder.io/qwik';
import 
import Footer from '~/components/Footer';

export default component$(() => {
  return (
    <div class="flex gap-12 xl:gap-20 items-stretch content-container">
      <SideBar />
      <main class="contents">
        <div class="docs-container">
          <article>
            <Slot />
          </article>
          <ContentNav />
          <Footer />
        </div>
        {hasOnThisPage && <OnThisPage />}
      </main>
    </div>
  );
});