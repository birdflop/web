import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {

  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center  min-h-[calc(100svh)] pt-[72px]">
      <div class="my-10 space-y-3 min-h-[60px]">
        <h1 class="text-4xl font-bold">BIRDFLOP PRIVACY POLICY</h1>
        <p>Last Revised: February 29, 2024</p>
        <p>Our privacy policy applies to information we collect when you use or access our website, application, or just interact with us. We may change this privacy policy from time to time. Whenever we make changes to this privacy policy, the changes are effective immediately after we post the revised privacy policy (as indicated by revising the date at the top of our privacy policy). We encourage you to review our privacy policy whenever you access our services to stay informed about our information practices and the ways you can help protect your privacy.</p>
        <h1 class="text-2xl font-bold">Collection of Information</h1>
        <h2 class="text-xl font-bold">Information You Provide to Us</h2>
        <p class="pl-5">We collect information you provide directly to us. For example, we collect information when you participate in any interactive features of our services, fill out a form, request customer support, provide any contact or identifying information or otherwise communicate with us. The types of information we may collect include your name, email address, postal address, and other contact or identifying information you choose to provide.</p>
        <h2 class="text-xl font-bold">Information We Collect Automatically When You Use the Services</h2>
        <p class="pl-5">When you access or use our services, we automatically collect information about you, potentially including:</p>
        <ul class="pl-10 list-disc list-inside">
          <li>Log Information: We may log information about your use of our services, including the type of browser you use, access times, pages viewed, your IP address and the page you visited before navigating to our services.</li>
          <li>Profiler Information: We may collect data on your submitted timings reports and Spark profiles.</li>
          <li>Information Collected by Cookies and Other Tracking Technologies: We use various technologies to collect information, including Microsoft Clarity, and this may include sending cookies to your computer. Cookies are small data files stored on your hard drive or in your device memory that helps us to improve our services and your experience, see which areas and features of our services are popular, and count visits. We may also collect information using web beacons (also known as "tracking pixels"). Web beacons are electronic images that may be used in our services or emails and to track count visits or understand usage and campaign effectiveness.</li>
        </ul>
        <p class="pl-5">For more details about how we collect information, including details about cookies and how to disable them, please see "Your Information Choices" below.</p>
        <h1 class="text-xl font-bold">Information We Collect From Other Sources</h1>
        <p class="pl-5">In order to provide you with access to the Service, or to provide you with better service in general, we may combine information obtained from other sources (for example, a third-party service whose application you have authorized or used to sign in) with information we collect through our services.</p>
        <h1 class="text-xl font-bold">Use of Information</h1>
        <p class="pl-5">We use information about you for various purposes, including to:</p>
        <ul class="pl-10 list-disc list-inside">
          <li>Provide, maintain and improve our services;</li>
          <li>Provide services you request, process transactions and to send you related information;</li>
          <li>Send you technical notices, updates, security alerts and support and administrative messages;</li>
          <li>Respond to your comments, questions and requests and provide customer service;</li>
          <li>Communicate with you about news and information related to our service;</li>
          <li>Monitor and analyze trends, usage and activities in connection with our services;</li>
          <li>Create datasets based on profiler information, intended to train models to improve server performance.</li>
        </ul>
        <p class="pl-5">By accessing and using our services, you consent to the processing and transfer of your information in and to the United States and other countries.</p>
        <h1 class="text-xl font-bold">Sharing of Information</h1>
        <p class="pl-5">We may share personal information about you as follows:</p>
        <ul class="pl-10 list-disc list-inside">
          <li>If we believe disclosure is reasonably necessary to comply with any applicable law, regulation, legal process or governmental request;</li>
          <li>To enforce applicable user agreements or policies, including our Terms of Service accessible at <a href="/terms">birdflop.com/terms</a>; and to protect us, our users or the public from harm or illegal activities;</li>
          <li>In connection with any merger, sale of Birdflop assets, financing or acquisition of all or a portion of our business to another company;</li>
          <li>If we notify you through our services (or in our privacy policy) that the information you provide will be shared in a particular manner and you provide such information.</li>
        </ul>
        <p class="pl-5">We may also share aggregated or anonymized information that does not directly identify you.</p>
        <h1 class="text-2xl font-bold">Third Party Analytics</h1>
        <p class="pl-5">We may allow third parties to provide analytics services. These third parties may use cookies, web beacons and other technologies to collect information about your use of the services and other websites, including your IP address, web browser, pages viewed, time spent on pages, links clicked and conversion information. This information may be used by us and third parties to, among other things, analyze and track data, determine the popularity of certain content and other websites and better understand your online activity. Our privacy policy does not apply to, and we are not responsible for, third party cookies, web beacons or other tracking technologies and we encourage you to check the privacy policies of these third parties to learn more about their privacy practices.</p>
        <h1 class="text-2xl font-bold">Security</h1>
        <p class="pl-5">We take reasonable measures to help protect personal information from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
        <h1 class="text-2xl font-bold">Your Information Choices & Cookies</h1>
        <p class="pl-5">Most web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove or reject browser cookies. Please note that if you choose to remove or reject cookies, this could affect the availability and functionality of our services.</p>
        <h1 class="text-2xl font-bold">Your California Privacy Rights</h1>
        <p class="pl-5">California law permits residents of California to request certain details about how their information is shared with third parties for direct marketing purposes. If you are a California resident and would like to make such a request, please contact us at <a href="mailto:ca-privacy@birdflop.com">ca-privacy@birdflop.com</a>. However, please note that under the law, Services such as ours that permit California residents to opt in to, or opt out of, this type of sharing are not required to provide such information upon receiving a request, but rather may respond by notifying the user of his or her right to prevent the disclosure. We do not share your data with third parties for direct marketing purposes by default.</p>
        <h1 class="text-2xl font-bold">Contact Us</h1>
        <p class="pl-5">If you have any questions about this privacy policy, please contact us at: <a href="mailto:privacy@birdflop.com">privacy@birdflop.com</a></p>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Birdflop: Privacy Policy',
  meta: [
    {
      name: 'description',
      content: 'View our privacy policy',
    },
    {
      name: 'og:description',
      content: 'View our privacy policy',
    },
    {
      name: 'og:image',
      content: '/branding/icon.png',
    },
  ],
};