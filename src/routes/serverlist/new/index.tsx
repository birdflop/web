import { component$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { InitialValues, useForm } from '@modular-forms/qwik';

export const useFormLoader = routeLoader$<InitialValues<ServerForm>>(() => {
  return {
    name: '',
    description: '',
    ip: '',
    port: 25565,
    votifierIp: '',
    votifierPort: 8192,
    website: '',
    banner: '',
    version: '',
    tags: '',
  };
});

export default component$(() => {

  const [serverForm, { Form, Field, FieldArray }] = useForm<ServerForm>({
    loader: useFormLoader(),
  });

  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100lvh-68px)]">
      <div class="text-center justify-center">
        <div id="noise" class="flex relative justify-center align-center">
          <div class="mt-10 space-y-3 min-h-[60px]">
            <h1 class="text-gray-100 text-6xl font-bold mb-6 fade-in animation-delay-100">
              <Form>
                <Field name="name">
                  {(field, props) => (
                    <div>
                      <input {...props} type="text" value={field.value} />
                      {field.error && <div>{field.error}</div>}
                    </div>
                  )}
                </Field>
                <Field name="description">
                  {(field, props) => (
                    <input {...props} type="text" value={field.value} />
                  )}
                </Field>
              </Form>
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Minecraft Hosting & Resources',
  meta: [
    {
      name: 'description',
      content: 'Minecraft Hosting & Resources',
    },
    {
      name: 'og:description',
      content: 'Minecraft Hosting & Resources',
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};
